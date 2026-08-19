const { app, ipcMain, shell } = require("electron");
const { registerAllServiceIPC } = require("./unified-service-ipc");

let registered = false;
let cleanupRegistered = false;

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

function registerCoreHandlers() {
  ipcMain.handle("get-system-info", async () => ({
    success: true,
    data: {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
    },
  }));

  ipcMain.handle("shell:open-external", async (_event, url) => {
    try {
      const parsed = new URL(String(url || ""));
      if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
        return { ok: false, error: `Blocked protocol: ${parsed.protocol}` };
      }
      await shell.openExternal(parsed.href);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  ipcMain.handle("app:quit", async () => {
    app.quit();
    return { ok: true };
  });
}

function registerCanonicalIPC({ enableTestHarness = false } = {}) {
  if (registered) return { registered: false, reason: "already_registered" };

  registerCoreHandlers();
  registerAllServiceIPC();

  if (enableTestHarness) {
    const { registerTestIPC } = require("./test-ipc");
    registerTestIPC();
  }

  registered = true;
  if (!cleanupRegistered) {
    cleanupRegistered = true;
    app.once("before-quit", () => {
      registered = false;
      cleanupRegistered = false;
    });
  }
  return { registered: true, reason: "canonical_registry_initialized" };
}

function getCanonicalIPCState() {
  return { registered };
}

module.exports = {
  getCanonicalIPCState,
  registerCanonicalIPC,
};
