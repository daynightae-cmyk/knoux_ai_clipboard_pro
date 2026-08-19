const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { registerCanonicalIPC } = require("./app/backend/ipc/canonical-ipc");

const isDev = process.env.NODE_ENV === "development" || process.argv.includes("--dev");
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    icon: path.join(__dirname, "assets", "icons", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "dist", "index.html")}`;

  mainWindow.loadURL(startUrl).catch((error) => {
    console.error("Failed to load application UI:", error);
    mainWindow.loadFile(path.join(__dirname, "public", "dev-unavailable.html"));
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

async function initializeBackendServices() {
  try {
    if (isDev) {
      require("ts-node").register({
        transpileOnly: true,
        compilerOptions: { module: "commonjs" },
      });
      const { initBackendServices } = require("./app/backend/init.ts");
      await initBackendServices();
    } else {
      const initPath = path.join(__dirname, "build", "app", "backend", "init.js");
      if (fs.existsSync(initPath)) {
        const { initBackendServices } = require(initPath);
        await initBackendServices();
      } else {
        console.warn("Compiled backend service initializer not found.");
      }
    }
  } catch (error) {
    console.error("Failed to initialize backend services:", error);
  }
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  await initializeBackendServices();

  // The sole registration point. Re-activation creates a window but never re-registers IPC.
  const ipcState = registerCanonicalIPC({ enableTestHarness: isDev });
  console.log(`Canonical IPC registry: ${ipcState.reason}`);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((error) => {
  console.error("Electron startup failed:", error);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Electron exception:", error);
});

module.exports = { createWindow, initializeBackendServices };
