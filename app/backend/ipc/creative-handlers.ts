// Creative Studio IPC Handlers
import { ipcMain } from 'electron';
import { creativeEngine } from '../ai/creative-engine';
import { createLogger } from '../../shared/logger';

const logger = createLogger({ module: 'creative-handlers' });

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Unknown error');

export function setupCreativeStudioIPC(): void {
  ipcMain.handle('creative:generate', async (event, input: string, settings: any) => {
    try {
      return await creativeEngine.generateCreative(input, settings);
    } catch (error) {
      logger.error('Error generating creative output', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:createProfile', async (event, name: string, settings: any) => {
    try {
      return creativeEngine.createProfile(name, settings);
    } catch (error) {
      logger.error('Error creating creative profile', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:switchProfile', async (event, profileId: string) => {
    try {
      return creativeEngine.switchProfile(profileId);
    } catch (error) {
      logger.error('Error switching creative profile', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:getCurrentProfile', async () => {
    try {
      return creativeEngine.getCurrentProfile();
    } catch (error) {
      logger.error('Error getting current creative profile', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:getAllProfiles', async () => {
    try {
      return creativeEngine.getAllProfiles();
    } catch (error) {
      logger.error('Error getting creative profiles', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:updateSettings', async (event, settings: any) => {
    try {
      creativeEngine.updateProfileSettings(settings);
      return { success: true };
    } catch (error) {
      logger.error('Error updating creative settings', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:getHistory', async (event, limit?: number) => {
    try {
      return creativeEngine.getHistory(limit);
    } catch (error) {
      logger.error('Error getting creative history', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  ipcMain.handle('creative:getScore', async () => {
    try {
      return creativeEngine.getCreativeScore();
    } catch (error) {
      logger.error('Error getting creative score', error instanceof Error ? error : undefined);
      return { success: false, error: errorMessage(error) };
    }
  });

  logger.info('✅ Creative Studio IPC registered');
}
