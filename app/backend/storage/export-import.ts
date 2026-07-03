import fs from 'fs/promises';
import path from 'path';
import { LocalDatabase } from './local-db';
import { logger } from '../../shared/logger';

export class DataExchange {
  private db: LocalDatabase;

  constructor(db: LocalDatabase) {
    this.db = db;
  }

  public async exportToJSON(destinationPath: string): Promise<boolean> {
    try {
      const allData = await this.db.getHistory(10000); // Max export limit
      const jsonContent = JSON.stringify(allData, null, 2);
      await fs.writeFile(destinationPath, jsonContent, 'utf-8');
      return true;
    } catch (error) {
      logger.error('Export failed:', error);
      return false;
    }
  }

  public async importFromJSON(sourcePath: string): Promise<number> {
    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      const data = JSON.parse(content);
      
      let count = 0;
      if (Array.isArray(data)) {
        for (const item of data) {
           // Basic validation
           if (item.content && item.format) {
             await this.db.saveItem({
               ...item,
               timestamp: new Date(item.timestamp) // Ensure date restoration
             });
             count++;
           }
        }
      }
      return count;
    } catch (error) {
      logger.error('Import failed:', error);
      throw error;
    }
  }
}
