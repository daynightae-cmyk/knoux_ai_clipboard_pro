const { clipboard } = require('electron');
const { databaseService } = require('../services/databaseService');

class RealClipboardWatcher {
  constructor() {
    this.isWatching = false;
    this.lastContent = '';
    this.watchInterval = null;
    this.pollInterval = 1000; // Check every second
  }

  async start() {
    if (this.isWatching) return;
    
    console.log('🔍 Starting real clipboard monitoring...');
    this.isWatching = true;
    
    // Get initial clipboard content
    try {
      this.lastContent = clipboard.readText() || '';
    } catch (error) {
      console.warn('⚠️ Could not read initial clipboard:', error);
      this.lastContent = '';
    }
    
    // Start polling
    this.watchInterval = setInterval(() => {
      this.checkClipboard();
    }, this.pollInterval);
    
    console.log('✅ Clipboard monitoring started');
  }

  stop() {
    if (!this.isWatching) return;
    
    console.log('🛑 Stopping clipboard monitoring...');
    this.isWatching = false;
    
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    
    console.log('✅ Clipboard monitoring stopped');
  }

  async checkClipboard() {
    if (!this.isWatching) return;
    
    try {
      const currentContent = clipboard.readText() || '';
      
      // Check if content changed
      if (currentContent !== this.lastContent && currentContent.trim()) {
        console.log('📋 New clipboard content detected');
        await this.handleNewContent(currentContent);
        this.lastContent = currentContent;
      }
    } catch (error) {
      console.error('❌ Error checking clipboard:', error);
    }
  }

  async handleNewContent(content) {
    try {
      const clipboardItem = {
        content: content,
        type: this.detectContentType(content),
        timestamp: Date.now(),
        isFavorite: false,
        source: 'clipboard',
        category: null,
        metadata: JSON.stringify({
          length: content.length,
          wordCount: content.split(/\s+/).length
        })
      };

      // Save to database if available
      if (databaseService && typeof databaseService.saveClipboardItem === 'function') {
        const id = await databaseService.saveClipboardItem(clipboardItem);
        console.log('✅ Clipboard item saved to database:', id);
      } else {
        console.log('📝 Database not available, item logged only');
      }
    } catch (error) {
      console.error('❌ Error handling new clipboard content:', error);
    }
  }

  detectContentType(content) {
    if (!content || typeof content !== 'string') return 'unknown';
    
    const trimmed = content.trim();
    
    // URL detection
    if (/^https?:\/\/.+/.test(trimmed)) return 'url';
    
    // Email detection
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email';
    
    // Number detection
    if (/^\d+(\.\d+)?$/.test(trimmed)) return 'number';
    
    // Code detection (basic)
    if (/^(function|class|const|let|var|if|for|while|import|export)\s/.test(trimmed)) return 'code';
    
    // File path detection
    if (/^[a-zA-Z]:\\|^\/|^\.\/|^\.\.\//.test(trimmed)) return 'file';
    
    return 'text';
  }

  async getRecentItems(limit = 50) {
    try {
      if (databaseService && typeof databaseService.getClipboardItems === 'function') {
        return await databaseService.getClipboardItems(limit, 0);
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting recent items:', error);
      return [];
    }
  }

  async searchItems(query, limit = 50) {
    try {
      if (databaseService && typeof databaseService.searchClipboardItems === 'function') {
        return await databaseService.searchClipboardItems(query, limit);
      }
      return [];
    } catch (error) {
      console.error('❌ Error searching items:', error);
      return [];
    }
  }
}

// Singleton instance
const realClipboardWatcher = new RealClipboardWatcher();

module.exports = { realClipboardWatcher, RealClipboardWatcher };