// Creative Studio IPC Handlers
import { ipcMain } from 'electron';
import { creativeEngine } from '../ai/creative-engine';

export function setupCreativeStudioIPC(): void {
  ipcMain.handle('creative:generate', async (event, input: string, settings: any) => {
    try {
      return await creativeEngine.generateCreative(input, settings);
    } catch (err) {
      console.error('[creative:generate] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Creative generation failed' };
    }
  });

  ipcMain.handle('creative:createProfile', async (event, name: string, settings: any) => {
    try {
      return creativeEngine.createProfile(name, settings);
    } catch (err) {
      console.error('[creative:createProfile] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Profile creation failed' };
    }
  });

  ipcMain.handle('creative:switchProfile', async (event, profileId: string) => {
    try {
      return creativeEngine.switchProfile(profileId);
    } catch (err) {
      console.error('[creative:switchProfile] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Profile switch failed' };
    }
  });

  ipcMain.handle('creative:getCurrentProfile', async () => {
    try {
      return creativeEngine.getCurrentProfile();
    } catch (err) {
      console.error('[creative:getCurrentProfile] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Failed to get current profile' };
    }
  });

  ipcMain.handle('creative:getAllProfiles', async () => {
    try {
      return creativeEngine.getAllProfiles();
    } catch (err) {
      console.error('[creative:getAllProfiles] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Failed to get profiles' };
    }
  });

  ipcMain.handle('creative:updateSettings', async (event, settings: any) => {
    try {
      creativeEngine.updateProfileSettings(settings);
      return { success: true };
    } catch (err) {
      console.error('[creative:updateSettings] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Settings update failed' };
    }
  });

  ipcMain.handle('creative:getHistory', async (event, limit?: number) => {
    try {
      return creativeEngine.getHistory(limit);
    } catch (err) {
      console.error('[creative:getHistory] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Failed to get history' };
    }
  });

  ipcMain.handle('creative:getScore', async () => {
    try {
      return creativeEngine.getCreativeScore();
    } catch (err) {
      console.error('[creative:getScore] Engine error:', err instanceof Error ? err.message : String(err));
      return { success: false, error: 'Failed to get creative score' };
    }
  });

  console.log('✅ Creative Studio IPC registered');
}
