import { autoUpdater } from 'electron-updater';
import { logger } from '../../shared/logger';
import { BrowserWindow, ipcMain } from 'electron';

export class UpdateManager {
  private static mainWindow: BrowserWindow | null = null;

  public static initialize(window: BrowserWindow) {
    this.mainWindow = window;

    autoUpdater.logger = logger;
    autoUpdater.autoDownload = false; // Let user confirm

    this.registerListeners();
  }

  public static checkForUpdates() {
    try {
      autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error('Failed to check for updates:', error);
    }
  }

  private static registerListeners() {
    autoUpdater.on('checking-for-update', () => {
      this.sendToWindow('update-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      logger.info('Update available:', info.version);
      this.sendToWindow('update-status', { status: 'available', info });
    });

    autoUpdater.on('update-not-available', () => {
      this.sendToWindow('update-status', { status: 'up-to-date' });
    });

    autoUpdater.on('error', (err) => {
      logger.error('Update error:', err);
      this.sendToWindow('update-status', { status: 'error', error: err.message });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.sendToWindow('update-status', { 
        status: 'downloading', 
        progress: progressObj.percent 
      });
    });

    autoUpdater.on('update-downloaded', () => {
      this.sendToWindow('update-status', { status: 'downloaded' });
      
      // Handle install request
      ipcMain.handleOnce('install-update', () => {
        autoUpdater.quitAndInstall();
      });
    });

    // Handle download start request
    ipcMain.handle('start-download-update', () => {
      autoUpdater.downloadUpdate();
    });
  }

  private static sendToWindow(channel: string, data: any) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
}
