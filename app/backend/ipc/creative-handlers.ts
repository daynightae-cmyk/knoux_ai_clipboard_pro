// Creative Studio IPC Handlers
import { ipcMain } from 'electron';
import { creativeEngine } from '../ai/creative-engine';

export function setupCreativeStudioIPC(): void {
  ipcMain.handle('creative:generate', async (event, input: string, settings: any) => {
    return await creativeEngine.generateCreative(input, settings);
  });

  ipcMain.handle('creative:createProfile', async (event, name: string, settings: any) => {
    return creativeEngine.createProfile(name, settings);
  });

  ipcMain.handle('creative:switchProfile', async (event, profileId: string) => {
    return creativeEngine.switchProfile(profileId);
  });

  ipcMain.handle('creative:getCurrentProfile', async () => {
    return creativeEngine.getCurrentProfile();
  });

  ipcMain.handle('creative:getAllProfiles', async () => {
    return creativeEngine.getAllProfiles();
  });

  ipcMain.handle('creative:updateSettings', async (event, settings: any) => {
    creativeEngine.updateProfileSettings(settings);
    return { success: true };
  });

  ipcMain.handle('creative:getHistory', async (event, limit?: number) => {
    return creativeEngine.getHistory(limit);
  });

  ipcMain.handle('creative:getScore', async () => {
    return creativeEngine.getCreativeScore();
  });

  console.log('✅ Creative Studio IPC registered');
}
