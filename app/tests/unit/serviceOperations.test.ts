import { beforeEach, describe, expect, it, vi } from "vitest";
import { PRODUCTION_SERVICES } from "@renderer/services/productionCatalog";
import { runServiceOperation } from "@renderer/services/serviceOperations";

const service = (id: string) => {
  const found = PRODUCTION_SERVICES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing catalog service: ${id}`);
  return found;
};

describe("customized Electron service operations", () => {
  beforeEach(() => {
    (window as any).knoux = {
      clipboard: {
        startMonitoring: vi.fn().mockResolvedValue({ ok: true, success: true, data: { monitoring: true } }),
      },
      system: {
        enableAutostart: vi.fn().mockResolvedValue({ ok: true, success: true, data: { enabled: true, supported: true, platform: "win32" } }),
      },
      security: {
        status: vi.fn().mockResolvedValue({ ok: true, success: true, data: { available: true, algorithm: "AES-256-GCM", kdf: "scrypt" } }),
      },
    };
  });

  it("starts the live clipboard monitor through the Electron bridge", async () => {
    const result = await runServiceOperation(service("windows-live-clipboard-monitor"), "monitor");
    expect(result.ok).toBe(true);
    expect(result.status).toBe("active");
    expect((window as any).knoux.clipboard.startMonitoring).toHaveBeenCalledOnce();
  });

  it("enables native start-on-login through the system bridge", async () => {
    const result = await runServiceOperation(service("start-on-login-status"), "enable");
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ready");
    expect((window as any).knoux.system.enableAutostart).toHaveBeenCalledOnce();
  });

  it("reports the native AES-256-GCM vault capability", async () => {
    const result = await runServiceOperation(service("vault-encryption"), "check");
    expect(result.ok).toBe(true);
    expect(result.status).toBe("ready");
    expect(result.output).toContain("AES-256-GCM");
    expect((window as any).knoux.security.status).toHaveBeenCalledOnce();
  });

  it("keeps the same services guarded when the Electron bridge is absent", async () => {
    delete (window as any).knoux;
    const monitor = await runServiceOperation(service("windows-live-clipboard-monitor"), "monitor");
    const vault = await runServiceOperation(service("vault-encryption"), "check");
    expect(monitor.ok).toBe(false);
    expect(monitor.status).toBe("guarded");
    expect(vault.ok).toBe(false);
    expect(vault.status).toBe("guarded");
  });
});
