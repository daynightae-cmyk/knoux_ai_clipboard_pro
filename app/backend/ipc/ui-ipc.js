const { ipcMain } = require('electron');

function registerUIHandlers() {
  ipcMain.handle('ui:getProfiles', async () => {
    return {
      success: true,
      profiles: [
        { id: 'developer', name: 'Developer Mode', theme: 'dark' },
        { id: 'writer', name: 'Writer Mode', theme: 'light' },
        { id: 'designer', name: 'Designer Mode', theme: 'creative' }
      ]
    };
  });

  ipcMain.handle('ui:morph', async (event, morphType, options) => {
    return {
      success: true,
      morphResult: {
        type: morphType,
        applied: true,
        theme: options.theme || 'default',
        timestamp: Date.now()
      }
    };
  });

  ipcMain.handle('ui:switchStyle', async (event, styleId) => {
    return {
      success: true,
      style: {
        id: styleId,
        applied: true,
        timestamp: Date.now()
      }
    };
  });

  console.log('✅ UI IPC handlers registered');
}

module.exports = { registerUIHandlers };
