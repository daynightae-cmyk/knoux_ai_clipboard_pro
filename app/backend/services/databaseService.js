/**
 * Simple Database Service - Knoux Clipboard AI
 * Basic in-memory storage for clipboard items
 */

class DatabaseService {
  constructor() {
    this.items = new Map();
    this.nextId = 1;
  }

  async initialize() {
    console.log('📦 Database service initialized (in-memory)');
  }

  async saveClipboardItem(item) {
    const id = this.nextId++;
    const itemWithId = { ...item, id, searchIndex: item.content.toLowerCase() };
    this.items.set(id, itemWithId);
    return id;
  }

  async getClipboardItems(limit = 50, offset = 0) {
    const items = Array.from(this.items.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);
    return items;
  }

  async searchClipboardItems(query, limit = 50) {
    const searchTerm = query.toLowerCase();
    const items = Array.from(this.items.values())
      .filter(item => item.searchIndex.includes(searchTerm))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return items;
  }

  async cleanup() {
    this.items.clear();
    console.log('🧹 Database service cleaned up');
  }
}

// Singleton instance
const databaseService = new DatabaseService();

module.exports = { databaseService, DatabaseService };