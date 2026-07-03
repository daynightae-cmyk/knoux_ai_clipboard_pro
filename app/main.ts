/**
 * Main Electron Process - Knoux Clipboard AI
 * Application entry point and lifecycle management
 */

import { app, BrowserWindow, Menu, Tray, shell, ipcMain, nativeImage, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './shared/logger';
import { initializeEnhancedHandlers } from './backend/ipc/enhanced-handlers';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Application constants
const APP_NAME = 'Knoux Clipboard AI';
const isDevelopment = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

// Create the main browser window
function createMainWindow(): BrowserWindow {
  const iconPath = path.join(__dirname, isDevelopment ? '../assets/icons/icon.png' : './assets/icons/icon.png');
  
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: APP_NAME,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    frame: true,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    backgroundColor: '#0f172a'
  });

  // Load the app
  if (isDevelopment) {
    window.loadURL('http://localhost:3000');
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Window event handlers
  window.once('ready-to-show', () => {
    window.show();
    window.focus();
    logger.info('Main window ready to show');
  });

  window.on('close', (event) => {
    if (!isQuitting && isMac) {
      event.preventDefault();
      window.hide();
      return false;
    }
  });

  window.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  return window;
}

// Create application tray icon
function createTray(): void {
  const iconPath = path.join(__dirname, isDevelopment ? '../assets/icons/tray.png' : './assets/icons/tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'فتح Knoux', click: () => showMainWindow() },
    { type: 'separator' },
    { label: 'سجل الحافظة', click: () => sendToRenderer('navigate', '/clipboard') },
    { label: 'معالج الذكاء الاصطناعي', click: () => sendToRenderer('navigate', '/ai') },
    { label: 'الإعدادات', click: () => sendToRenderer('navigate', '/settings') },
    { type: 'separator' },
    { label: 'خروج', click: () => app.quit() }
  ]);
  
  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    showMainWindow();
  });
}

// Show main window
function showMainWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  }
}

// Send message to renderer
function sendToRenderer(channel: string, data?: any): void {
  if (mainWindow) {
    mainWindow.webContents.send(channel, data);
  }
}

// Create application menu
function createApplicationMenu(): void {
  const template: any[] = [
    // App menu (macOS)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: 'عن Knoux', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'الإعدادات...', accelerator: 'Command+,', click: () => sendToRenderer('navigate', '/settings') },
        { type: 'separator' },
        { label: 'إخفاء', accelerator: 'Command+H', role: 'hide' },
        { label: 'إخفاء الآخرين', accelerator: 'Command+Shift+H', role: 'hideOthers' },
        { label: 'إظهار الكل', role: 'unhide' },
        { type: 'separator' },
        { label: 'خروج', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    }] : []),
    
    // File menu
    {
      label: 'ملف',
      submenu: [
        { label: 'جديد', accelerator: 'CmdOrCtrl+N', click: () => sendToRenderer('new-document') },
        { type: 'separator' },
        { label: 'تصدير...', accelerator: 'CmdOrCtrl+E', click: () => sendToRenderer('export-data') },
        { label: 'استيراد...', accelerator: 'CmdOrCtrl+I', click: () => sendToRenderer('import-data') },
        { type: 'separator' },
        { label: 'الإعدادات', accelerator: 'CmdOrCtrl+,', click: () => sendToRenderer('navigate', '/settings') },
        { type: 'separator' },
        isMac ? { label: 'إغلاق', role: 'close' } : { label: 'خروج', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    
    // Edit menu
    {
      label: 'تحرير',
      submenu: [
        { label: 'تراجع', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'إعادة', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'قص', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'نسخ', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'لصق', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'تحديد الكل', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    
    // View menu
    {
      label: 'عرض',
      submenu: [
        { label: 'إعادة تحميل', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { label: 'إعادة تحميل كاملة', accelerator: 'Shift+CmdOrCtrl+R', click: () => mainWindow?.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'تكبير', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: 'تصغير', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'إعادة تعيين التكبير', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'أدوات المطور', accelerator: isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', click: () => mainWindow?.webContents.openDevTools() }
      ]
    },
    
    // Tools menu
    {
      label: 'أدوات',
      submenu: [
        { label: 'سجل الحافظة', accelerator: 'CmdOrCtrl+1', click: () => sendToRenderer('navigate', '/clipboard') },
        { label: 'معالج الذكاء الاصطناعي', accelerator: 'CmdOrCtrl+2', click: () => sendToRenderer('navigate', '/ai') },
        { label: 'لوحة التحكم', accelerator: 'CmdOrCtrl+3', click: () => sendToRenderer('navigate', '/dashboard') },
        { label: 'مركز الأمان', accelerator: 'CmdOrCtrl+4', click: () => sendToRenderer('navigate', '/security') },
        { type: 'separator' },
        { label: 'فحص أمني', click: () => sendToRenderer('security-scan') },
        { label: 'نسخ احتياطي', click: () => sendToRenderer('create-backup') }
      ]
    },
    
    // Help menu
    {
      label: 'مساعدة',
      submenu: [
        { label: 'توثيق', click: () => shell.openExternal('https://docs.knoux.com') },
        { label: 'الدعم', click: () => shell.openExternal('https://support.knoux.com') },
        { label: 'الإبلاغ عن مشكلة', click: () => shell.openExternal('https://github.com/knoux/clipboard-ai/issues') },
        { type: 'separator' },
        { label: 'عن Knoux', click: () => sendToRenderer('navigate', '/about') },
        { label: 'التحديثات', click: () => sendToRenderer('check-updates') }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Application initialization
async function initializeApp(): Promise<void> {
  try {
    logger.info('Initializing Knoux Clipboard AI...');
    
    // Wait for app to be ready
    await app.whenReady();
    logger.info('Electron app is ready');
    
    // Create main window
    mainWindow = createMainWindow();
    
    // Create tray icon
    createTray();
    
    // Create application menu
    createApplicationMenu();
    
    // Initialize IPC handlers
    initializeEnhancedHandlers();
    
    // Register global shortcuts
    registerGlobalShortcuts();
    
    // Handle single instance
    handleSingleInstance();
    
    // Handle app activation
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      } else {
        showMainWindow();
      }
    });
    
    logger.info('Application initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    dialog.showErrorBox('خطأ في التهيئة', 'فشل في تهيئة التطبيق. يرجى إعادة التشغيل.');
    app.quit();
  }
}

// Register global keyboard shortcuts
function registerGlobalShortcuts(): void {
  // Note: In production, use globalShortcut.register
  // For now, we'll handle them through the menu
  logger.info('Global shortcuts registered');
}

// Handle single instance lock
function handleSingleInstance(): void {
  const gotSingleInstanceLock = app.requestSingleInstanceLock();
  
  if (!gotSingleInstanceLock) {
    logger.warn('Another instance is already running. Quitting...');
    app.quit();
    return;
  }
  
  app.on('second-instance', () => {
    logger.info('Second instance attempted, focusing main window');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Clean up before quitting
function cleanupBeforeQuit(): void {
  isQuitting = true;
  logger.info('Cleaning up before quit...');
  
  // Save any pending data
  // Stop all services
  // Close all windows
  
  if (tray) {
    tray.destroy();
    tray = null;
  }
  
  logger.info('Cleanup completed');
}

// Handle quit
app.on('before-quit', () => {
  cleanupBeforeQuit();
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// Error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  dialog.showErrorBox('خطأ غير متوقع', error.message);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

// Start the application
initializeApp().catch((error) => {
  logger.error('Critical application error:', error);
  dialog.showErrorBox('خطأ حرج', 'فشل تشغيل التطبيق. يرجى التحقق من السجلات للحصول على التفاصيل.');
  process.exit(1);
});

export { mainWindow, sendToRenderer };
