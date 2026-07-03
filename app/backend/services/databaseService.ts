/**
 * Database Service - Knoux Clipboard AI
 * Unified SQLite database for all data storage
 */

import { app } from 'electron';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export interface ClipboardItem {
  id?: number;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: number;
  isFavorite: boolean;
  category?: string;
  source?: string;
  metadata?: string;
  searchIndex: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sessionId?: string;
}

export interface VIPStatus {
  id: number;
  isVIP: boolean;
  activationDate?: number;
  expiryDate?: number;
  features: string;
}

class DatabaseService {
  private db: Database | null = null;
  private dbPath: string;
  private isInitialized: boolean = false;

  constructor() {
    // Use a fallback path if app is not available
    try {
      const userDataPath = app?.getPath('userData') || process.cwd() + '/data';
      this.dbPath = path.join(userDataPath, 'knoux-clipboard.db');
    } catch (error) {
      this.dbPath = path.join(process.cwd(), 'data', 'knoux-clipboard.db');
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve, reject) => {
      try {
        // Ensure directory exists
        const dir = path.dirname(this.dbPath);
        if (!require('fs').existsSync(dir)) {
          require('fs').mkdirSync(dir, { recursive: true });
        }

        this.db = new sqlite3.Database(this.dbPath, (err) => {
          if (err) {
            console.error('❌ Error opening database:', err);
            reject(err);
            return;
          }
          console.log('✅ Database connected:', this.dbPath);
          this.createTables()
            .then(() => {
              this.isInitialized = true;
              resolve();
            })
            .catch(reject);
        });
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        reject(error);
      }
    });
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS clipboard_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('text', 'image', 'file')),
          timestamp INTEGER NOT NULL,
          isFavorite INTEGER DEFAULT 0,
          category TEXT,
          source TEXT,
          metadata TEXT,
          searchIndex TEXT
        );

        CREATE TABLE IF NOT EXISTS ai_chat_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          sessionId TEXT
        );

        CREATE TABLE IF NOT EXISTS vip_status (
          id INTEGER PRIMARY KEY CHECK(id = 1),
          is_vip INTEGER DEFAULT 0,
          activation_date INTEGER,
          expiry_date INTEGER,
          features TEXT
        );

        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          timestamp INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL CHECK(level IN ('info', 'warn', 'error')),
          message TEXT NOT NULL,
          timestamp INTEGER DEFAULT (strftime('%s', 'now')),
          context TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_clipboard_timestamp ON clipboard_items(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_clipboard_favorite ON clipboard_items(isFavorite);
        CREATE INDEX IF NOT EXISTS idx_clipboard_type ON clipboard_items(type);
        CREATE INDEX IF NOT EXISTS idx_clipboard_search ON clipboard_items(searchIndex);
        CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON ai_chat_history(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_chat_session ON ai_chat_history(sessionId);
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp DESC);
      `;

      this.db!.exec(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Error creating tables:', err);
          reject(err);
        } else {
          console.log('✅ Database tables ready');
          this.initializeDefaultData()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  private async initializeDefaultData(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      // Initialize VIP status
      this.db!.run(
        'INSERT OR IGNORE INTO vip_status (id, is_vip, features) VALUES (1, 0, ?)',
        [JSON.stringify([])],
        (err) => {
          if (err) {
            console.error('Error initializing VIP status:', err);
            reject(err);
          } else {
            console.log('✅ Default data initialized');
            resolve();
          }
        }
      );
    });
  }

  // Clipboard Items Methods
  async saveClipboardItem(item: Omit<ClipboardItem, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const searchIndex = `${item.content} ${item.category || ''} ${item.source || ''}`.toLowerCase();
      
      const sql = `
        INSERT INTO clipboard_items (content, type, timestamp, isFavorite, category, source, metadata, searchIndex)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [
          item.content,
          item.type,
          item.timestamp,
          item.isFavorite ? 1 : 0,
          item.category,
          item.source,
          item.metadata,
          searchIndex
        ],
        function (err) {
          if (err) {
            console.error('❌ Error saving clipboard item:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getClipboardItems(limit: number = 100, offset: number = 0): Promise<ClipboardItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        SELECT id, content, type, timestamp, isFavorite, category, source, metadata, searchIndex
        FROM clipboard_items
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `;

      this.db.all(sql, [limit, offset], (err, rows: any[]) => {
        if (err) {
          console.error('❌ Error getting clipboard items:', err);
          reject(err);
        } else {
          const items = rows.map(row => ({
            ...row,
            isFavorite: Boolean(row.isFavorite)
          }));
          resolve(items);
        }
      });
    });
  }

  async getClipboardItemById(id: number): Promise<ClipboardItem | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        SELECT id, content, type, timestamp, isFavorite, category, source, metadata, searchIndex
        FROM clipboard_items
        WHERE id = ?
        LIMIT 1
      `;

      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          console.error('❌ Error getting clipboard item by id:', err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            isFavorite: Boolean(row.isFavorite),
          });
        }
      });
    });
  }

  async searchClipboardItems(query: string, limit: number = 50): Promise<ClipboardItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        SELECT id, content, type, timestamp, isFavorite, category, source, metadata, searchIndex
        FROM clipboard_items
        WHERE searchIndex LIKE ?
        ORDER BY timestamp DESC
        LIMIT ?
      `;

      this.db.all(sql, [`%${query.toLowerCase()}%`, limit], (err, rows: any[]) => {
        if (err) {
          console.error('❌ Error searching clipboard items:', err);
          reject(err);
        } else {
          const items = rows.map(row => ({
            ...row,
            isFavorite: Boolean(row.isFavorite)
          }));
          resolve(items);
        }
      });
    });
  }

  async getFavoriteClipboardItems(): Promise<ClipboardItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        SELECT id, content, type, timestamp, isFavorite, category, source, metadata, searchIndex
        FROM clipboard_items
        WHERE isFavorite = 1
        ORDER BY timestamp DESC
      `;

      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          console.error('❌ Error getting favorite items:', err);
          reject(err);
        } else {
          const items = rows.map(row => ({
            ...row,
            isFavorite: Boolean(row.isFavorite)
          }));
          resolve(items);
        }
      });
    });
  }

  async toggleFavorite(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        'UPDATE clipboard_items SET isFavorite = CASE WHEN isFavorite = 1 THEN 0 ELSE 1 END WHERE id = ?',
        [id],
        function (err) {
          if (err) {
            console.error('❌ Error toggling favorite:', err);
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async deleteClipboardItem(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM clipboard_items WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('❌ Error deleting clipboard item:', err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async clearClipboardHistory(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM clipboard_items', (err) => {
        if (err) {
          console.error('❌ Error clearing clipboard history:', err);
          reject(err);
        } else {
          console.log('✅ Clipboard history cleared');
          resolve();
        }
      });
    });
  }

  // Chat History Methods
  async saveChatMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        INSERT INTO ai_chat_history (role, content, timestamp, sessionId)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [message.role, message.content, message.timestamp, message.sessionId],
        function (err) {
          if (err) {
            console.error('❌ Error saving chat message:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getChatHistory(limit: number = 100, sessionId?: string): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      let sql = `
        SELECT id, role, content, timestamp, sessionId
        FROM ai_chat_history
      `;
      const params: any[] = [];

      if (sessionId) {
        sql += ' WHERE sessionId = ?';
        params.push(sessionId);
      }

      sql += ' ORDER BY timestamp ASC LIMIT ?';
      params.push(limit);

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          console.error('❌ Error getting chat history:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async clearChatHistory(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM ai_chat_history', (err) => {
        if (err) {
          console.error('❌ Error clearing chat history:', err);
          reject(err);
        } else {
          console.log('✅ Chat history cleared');
          resolve();
        }
      });
    });
  }

  // VIP Status Methods
  async getVIPStatus(): Promise<VIPStatus> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(
        'SELECT * FROM vip_status WHERE id = 1',
        (err, row: any) => {
          if (err) {
            console.error('❌ Error getting VIP status:', err);
            reject(err);
          } else {
            resolve({
              id: row?.id || 1,
              isVIP: Boolean(row?.is_vip),
              activationDate: row?.activation_date,
              expiryDate: row?.expiry_date,
              features: row?.features || '[]'
            });
          }
        }
      );
    });
  }

  async setVIPStatus(isVIP: boolean, expiryDate?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const now = Date.now();
      const features = JSON.stringify([
        'unlimited_history',
        'advanced_ai',
        'cloud_sync',
        'premium_themes',
        'priority_support',
        'enhanced_security'
      ]);

      const sql = `
        UPDATE vip_status
        SET is_vip = ?, activation_date = ?, expiry_date = ?, features = ?
        WHERE id = 1
      `;

      this.db.run(
        sql,
        [isVIP ? 1 : 0, isVIP ? now : null, expiryDate || null, features],
        (err) => {
          if (err) {
            console.error('❌ Error setting VIP status:', err);
            reject(err);
          } else {
            console.log('✅ VIP status updated');
            resolve();
          }
        }
      );
    });
  }

  // Settings Methods
  async getSetting(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get('SELECT value FROM app_settings WHERE key = ?', [key], (err, row: any) => {
        if (err) {
          console.error('❌ Error getting setting:', err);
          reject(err);
        } else {
          resolve(row?.value || null);
        }
      });
    });
  }

  async setSetting(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        [key, value],
        (err) => {
          if (err) {
            console.error('❌ Error setting setting:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Statistics Methods
  async getStatistics(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const sql = `
        SELECT 
          COUNT(*) as total_clipboard_items,
          COUNT(CASE WHEN isFavorite = 1 THEN 1 END) as favorite_items,
          COUNT(CASE WHEN type = 'text' THEN 1 END) as text_items,
          COUNT(CASE WHEN type = 'image' THEN 1 END) as image_items,
          COUNT(CASE WHEN type = 'file' THEN 1 END) as file_items,
          MAX(timestamp) as last_clipboard_time
        FROM clipboard_items
      `;

      this.db.get(sql, [], (err, row: any) => {
        if (err) {
          console.error('❌ Error getting statistics:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close(): void {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('✅ Database closed');
        }
      });
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
