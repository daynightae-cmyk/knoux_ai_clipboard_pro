export const clipboard = {
  readText: () => "Test clipboard content",
  writeText: () => undefined,
};

export const app = {
  getPath: () => ".",
  getVersion: () => "1.0.0",
  isReady: () => true,
  whenReady: () => Promise.resolve(),
};

export const ipcMain = {
  handle: () => undefined,
  on: () => undefined,
  removeHandler: () => undefined,
};

export const BrowserWindow = class {};

export default {
  app,
  clipboard,
  ipcMain,
  BrowserWindow,
};
