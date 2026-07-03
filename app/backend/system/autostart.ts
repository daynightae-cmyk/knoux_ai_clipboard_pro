import { app } from 'electron';
import { logger } from '../../shared/logger';

export class AutoStartManager {
  /**
   * Configure application to launch at startup
   */
  public static setAutoStart(enable: boolean): void {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.info('AutoStart ignored in development mode');
        return;
      }

      app.setLoginItemSettings({
        openAtLogin: enable,
        openAsHidden: true, // Start minimized to tray
        path: app.getPath('exe'),
        args: [
          '--process-start-args', `"--hidden"`
        ]
      });

      logger.info(`Auto-start ${enable ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      logger.error('Failed to toggle auto-start:', error);
    }
  }

  public static isAutoStartEnabled(): boolean {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  }
}
