/**
 * Unit tests for runtime storage + sensitive-data scanning helpers.
 * Targets app/renderer/services/runtimeServices.ts (previously ~8% coverage).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClipboardItem } from "@renderer/types";
import {
  getStoredClips,
  getStorageHealth,
  compactLocalStore,
  detectSensitiveTypes,
  scanText,
  readSystemClipboard,
  writeSystemClipboard,
} from "@renderer/services/runtimeServices";

const makeItem = (overrides: Partial<ClipboardItem> = {}): ClipboardItem => ({
  id: overrides.id ?? `id-${Math.random().toString(36).slice(2)}`,
  content: "sample content",
  type: "text",
  timestamp: new Date().toISOString(),
  pinned: false,
  favorite: false,
  tags: [],
  source: "test",
  isSecure: false,
  ...overrides,
});

describe("runtimeServices", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getStoredClips", () => {
    it("returns an empty array when nothing is stored", () => {
      expect(getStoredClips()).toEqual([]);
    });

    it("returns stored clips when present", () => {
      const items = [makeItem({ id: "1" })];
      localStorage.setItem("knoux_clips", JSON.stringify(items));
      expect(getStoredClips()).toHaveLength(1);
    });

    it("returns an empty array on corrupted JSON", () => {
      localStorage.setItem("knoux_clips", "{not json");
      expect(getStoredClips()).toEqual([]);
    });

    it("returns an empty array when the stored value is not an array", () => {
      localStorage.setItem("knoux_clips", JSON.stringify({ nope: true }));
      expect(getStoredClips()).toEqual([]);
    });
  });

  describe("getStorageHealth", () => {
    it("computes byte/kb/mb metrics and record count", () => {
      const items = [makeItem({ id: "1" }), makeItem({ id: "2" })];
      const health = getStorageHealth(items);
      expect(health.records).toBe(2);
      expect(health.bytes).toBeGreaterThan(0);
      expect(health.kb).toBeCloseTo(health.bytes / 1024, 2);
      expect(health.usagePct).toBeGreaterThanOrEqual(0);
      expect(health.usagePct).toBeLessThanOrEqual(100);
    });
  });

  describe("compactLocalStore", () => {
    it("drops invalid entries, trims content, dedupes/caps tags and persists", () => {
      const items: any[] = [
        makeItem({ id: "1", content: "  trimmed  ", tags: ["a", "a", "b"] }),
        { id: "", content: "no id" },
        { id: "2" },
      ];
      const health = compactLocalStore(items as ClipboardItem[]);
      expect(health.records).toBe(1);

      const stored = JSON.parse(localStorage.getItem("knoux_clips") as string);
      expect(stored).toHaveLength(1);
      expect(stored[0].content).toBe("trimmed");
      expect(stored[0].tags).toEqual(["a", "b"]);
    });

    it("caps tags at 12 entries", () => {
      const manyTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);
      const health = compactLocalStore([makeItem({ id: "1", tags: manyTags })]);
      expect(health.records).toBe(1);
      const stored = JSON.parse(localStorage.getItem("knoux_clips") as string);
      expect(stored[0].tags).toHaveLength(12);
    });

    it("handles localStorage write errors gracefully", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage is full");
      });
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      compactLocalStore([makeItem({ id: "1" })]);
      expect(setItemSpy).toThrow("Storage is full");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to save compacted clips"),
        expect.any(Error)
      );
    });
  });

  describe("detectSensitiveTypes", () => {
    it("detects passwords and api keys", () => {
      expect(detectSensitiveTypes("password: hunter2secret")).toContain("password");
      expect(detectSensitiveTypes("api_key = ABCDEFGHIJKLMNOPQRSTUVWX")).toContain("api-key");
    });

    it("detects private keys", () => {
      expect(detectSensitiveTypes("-----BEGIN RSA PRIVATE KEY-----")).toContain("private-key");
    });

    it("detects emails, phones and card-like numbers", () => {
      expect(detectSensitiveTypes("admin@knoux.store")).toContain("email");
      expect(detectSensitiveTypes("+971503281920")).toContain("phone");
      expect(detectSensitiveTypes("4242 4242 4242 4242")).toContain("card-like-number");
    });

    it("returns an empty array for benign text", () => {
      expect(detectSensitiveTypes("hello world")).toEqual([]);
    });

    it("handles nullish input", () => {
      expect(detectSensitiveTypes(undefined as any)).toEqual([]);
    });
  });

  describe("scanText", () => {
    it("reports sensitive content", () => {
      const result = scanText("password: hunter2secret");
      expect(result.sensitive).toBe(true);
      expect(result.types.length).toBeGreaterThan(0);
      expect(result.message).toContain("Sensitive classes detected");
    });

    it("reports safe content", () => {
      const result = scanText("hello world");
      expect(result.sensitive).toBe(false);
      expect(result.types).toEqual([]);
      expect(result.message).toContain("No credential-like");
    });
  });

  describe("system clipboard helpers", () => {
    const originalClipboard = navigator.clipboard;

    afterEach(() => {
      vi.restoreAllMocks();
      Object.assign(navigator, { clipboard: originalClipboard });
    });

    it("readSystemClipboard returns clipboard text", async () => {
      Object.assign(navigator, {
        clipboard: { readText: vi.fn().mockResolvedValue("copied") },
      });
      await expect(readSystemClipboard()).resolves.toBe("copied");
    });

    it("readSystemClipboard returns empty string when read fails", async () => {
      Object.assign(navigator, {
        clipboard: { readText: vi.fn().mockRejectedValue(new Error("denied")) },
      });
      await expect(readSystemClipboard()).resolves.toBe("");
    });

    it("writeSystemClipboard returns true on success", async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
      await expect(writeSystemClipboard("x")).resolves.toBe(true);
    });

    it("writeSystemClipboard returns false on failure", async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      });
      await expect(writeSystemClipboard("x")).resolves.toBe(false);
    });
  });
});
