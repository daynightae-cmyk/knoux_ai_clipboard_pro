import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { app } from 'electron';
import { logger } from '../../shared/logger';
import { ClipboardItem } from '../../shared/types';

export class LocalDatabase {
  private db: Database | null = null;
  private readonly dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'knoux_clipboard.sqlite');
  }

  public async initialize() {
    try {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS clipboard (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          format TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          isFavorite BOOLEAN DEFAULT 0,
          searchVector TEXT -- Should be implemented as FTS in production
        );
        CREATE INDEX IF NOT EXISTS idx_timestamp ON clipboard(timestamp DESC);
      `);

      logger.info('Database initialized at:', this.dbPath);
    } catch (error) {
      logger.error('Failed to init DB:', error);
      throw error;
    }
  }

  public async saveItem(item: ClipboardItem): Promise<void> {
    if (!this.db) await this.initialize();
    
    try {
      await this.db?.run(
        `INSERT OR REPLACE INTO clipboard (id, content, format, timestamp, metadata) VALUES (?, ?, ?, ?, ?)`,
        item.id,
        item.content,
        item.format,
        item.timestamp.toISOString(),
        JSON.stringify(item.metadata || {})
      );
    } catch (err) {
      logger.error('DB Write error:', err);
    }
  }

  public async getHistory(limit: number = 50, offset: number = 0): Promise<ClipboardItem[]> {
    if (!this.db) await this.initialize();

    const rows = await this.db?.all(`SELECT * FROM clipboard ORDER BY timestamp DESC LIMIT ? OFFSET ?`, limit, offset);
    
    return (rows || []).map(row => ({
      id: row.id,
      content: row.content,
      format: row.format,
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  public async search(query: string): Promise<ClipboardItem[]> {
    // Basic LIKE search for this MVP implementation
    // Real impl should use FTS5 virtual tables
    if (!this.db) await this.initialize();

    const rows = await this.db?.all(
      `SELECT * FROM clipboard WHERE content LIKE ? ORDER BY timestamp DESC LIMIT 50`, 
      `%${query}%`
    );

    return (rows || []).map(row => ({
      id: row.id,
      content: row.content,
      format: row.format,
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }
}
