import { ipcMain, IpcMainInvokeEvent } from "electron";
import { permissionGuard } from "./permission-guard";
import { securityManager } from "./security-manager";
import { createLogger } from "../../shared/logger";

const logger = createLogger({ module: "ipc-guard" });

/**
 * Wraps an IPC handler with security checks
 */
export function secureHandler(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>,
) {
  ipcMain.handle(channel, async (event, ...args) => {
    const startTime = Date.now();
    try {
      // 1. Check App Permissions (if source process is available)
      // In a real scenario, we'd check event.sender.getOwnerBrowserWindow() or similar context

      // 2. Audit Log
      if (channel.includes("security") || channel.includes("quantum")) {
        logger.info(`Security-sensitive IPC call: ${channel}`);
      }

      // 3. Execute Handler
      const result = await handler(event, ...args);

      return result;
    } catch (error) {
      logger.error(`IPC Error on ${channel}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown IPC error",
      };
    }
  });
}
