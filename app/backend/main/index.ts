import { initializeEnhancedHandlers } from "./enhanced-handlers";
import {
  registerRealClipboardHandlers,
  registerRealAIHandlers,
  registerRealStorageHandlers,
  initializeRealServices,
} from "./real-handlers";
import { setupCreativeStudioIPC } from "./creative-handlers";
import { ipcMain } from "electron";
import { secureHandler } from "../security/ipc-guard";
import { createLogger } from "../../shared/logger";

const logger = createLogger({ module: "ipc-registry" });

export async function setupAllIPC() {
  logger.info("🔌 Wiring up all backend services...");

  // 1. Initialize Real Backend Services (DB, AI Engines, Watchers)
  await initializeRealServices();

  // 2. Register Core Handlers (Clipboard, Basic AI)
  // We wrap these to ensure they use the initialized services
  registerRealClipboardHandlers();
  registerRealAIHandlers();
  registerRealStorageHandlers();

  // 3. Register Enhanced & Revolutionary Handlers (Quantum, Vision, Blockchain)
  // Note: initializeEnhancedHandlers inside enhanced-handlers.ts registers:
  // - Settings, Language, Theme
  // - Database, System
  // - Quantum, Vision, Memory Bank
  initializeEnhancedHandlers();

  // 4. Register Creative Studio
  setupCreativeStudioIPC();

  // 5. Register Fallback/Utility Handlers
  ipcMain.handle("open-external", async (event, url) => {
    const { shell } = require("electron");
    return shell.openExternal(url);
  });

  logger.info("✅ All IPC channels registered and secured.");

  // Log all registered channels for debugging
  const registered = ipcMain.eventNames();
  logger.debug(`Active Channels: ${registered.length}`, registered);
}
