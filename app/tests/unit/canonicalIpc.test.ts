import { createRequire } from "module";
import { describe, expect, it, vi } from "vitest";

const requireFromTest = createRequire(import.meta.url);

describe("canonical IPC registry", () => {
  it("registers channels once and refuses duplicate registration", () => {
    const handle = vi.fn();
    const electronPath = requireFromTest.resolve("electron");
    const canonicalPath = requireFromTest.resolve("../../backend/ipc/canonical-ipc.js");
    const unifiedPath = requireFromTest.resolve("../../backend/ipc/unified-service-ipc.js");
    const originalElectron = requireFromTest.cache[electronPath];

    requireFromTest.cache[electronPath] = {
      id: electronPath,
      filename: electronPath,
      loaded: true,
      exports: {
        app: { getVersion: () => "1.1.0", once: vi.fn(), quit: vi.fn() },
        clipboard: { writeText: vi.fn() },
        ipcMain: { handle },
        shell: { openExternal: vi.fn() },
      },
    } as NodeModule;
    delete requireFromTest.cache[canonicalPath];
    delete requireFromTest.cache[unifiedPath];

    try {
      const { getCanonicalIPCState, registerCanonicalIPC } = requireFromTest(canonicalPath);
      const first = registerCanonicalIPC();
      const channels = handle.mock.calls.map(([channel]) => channel);
      const second = registerCanonicalIPC();

      expect(first).toEqual({ registered: true, reason: "canonical_registry_initialized" });
      expect(second).toEqual({ registered: false, reason: "already_registered" });
      expect(new Set(channels).size).toBe(channels.length);
      expect(channels).toContain("ai:run");
      expect(channels).toContain("system:ipc-integrity");
      expect(getCanonicalIPCState()).toEqual({ registered: true });
    } finally {
      delete requireFromTest.cache[canonicalPath];
      delete requireFromTest.cache[unifiedPath];
      if (originalElectron) requireFromTest.cache[electronPath] = originalElectron;
      else delete requireFromTest.cache[electronPath];
    }
  });
});
