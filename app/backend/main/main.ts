// main.ts - Main Electron Process
// KNOUX Clipboard AI Application

import { app, BrowserWindow, ipcMain, Tray, Menu } from "electron";
import * as path from "path";
import * as url from "url";
import { initBackendServices } from "./backend/init";
import { setupAllIPC } from "../ipc/index"; // Use the new unified index

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// ==================== Window Management ====================

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    frame: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // Points to the compiled preload.ts
    },
    icon: path.join(__dirname, "../../assets/icons/icon.png"),
    backgroundColor: "#1a1a1a",
  });

  // Load application
  if (process.env.NODE_ENV === "development") {
    // Development mode - load from Vite dev server
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from built files
    mainWindow.loadFile(path.join(__dirname, "../../app/renderer/index.html"));
  }

  // Event handlers
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting && process.platform !== "darwin") {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.hide();
      }
      return false;
    }
  });

  return mainWindow;
}

// ==================== Tray Management ====================

function createTray(): void {
  const iconPath = path.join(__dirname, "../../assets/icons/tray.png");

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open KNOUX",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: "Settings",
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send("navigate-to", "/settings");
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit KNOUX",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("KNOUX Clipboard AI");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ==================== Application Lifecycle ====================

async function initializeApplication(): Promise<void> {
  try {
    console.log("🚀 Initializing KNOUX Clipboard AI...");

    // Initialize backend services & IPC (Unified)
    // This handles DB connection, AI model loading, and IPC registration
    await setupAllIPC();

    // Create main window
    mainWindow = createMainWindow();

    // Create system tray
    createTray();

    console.log("✅ KNOUX Clipboard AI initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    app.quit();
  }
}

// ==================== Event Listeners ====================

app.whenReady().then(initializeApplication);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    initializeApplication();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

// ==================== Error Handling ====================

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// ==================== Single Instance Lock ====================

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Export for testing
export { createMainWindow, initializeApplication };
