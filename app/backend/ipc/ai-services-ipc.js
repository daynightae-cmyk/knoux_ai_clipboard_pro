const { ipcMain } = require('electron');

// Mock AI services for testing
const mockAIEngine = {
  summarize: async (text) => ({
    text: `Summary: ${text.substring(0, 100)}...`,
    tokensUsed: 50,
    model: 'local-llama',
  }),
  classify: async (content) => ({
    primaryType: content.includes('function') ? 'code' : 'text',
    confidence: 0.85,
    language: 'javascript',
  }),
  enhance: async (text) => ({
    text: `Enhanced: ${text}`,
    improvements: ['grammar', 'clarity'],
  }),
};

const mockClassifier = {
  classify: async (content) => ({
    primaryType: content.includes('{') ? 'json' : 'text',
    confidence: 0.9,
    isSensitive: false,
  }),
};

const mockSummarizer = {
  summarize: async (content, options = {}) => ({
    summary: content.substring(0, 200) + '...',
    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    compressionRatio: 0.7,
    confidence: 0.85,
  }),
};

function registerAIServicesIPC() {
  // AI Engine
  ipcMain.handle('ai-engine:summarize', async (event, text) => {
    try {
      return { success: true, data: await mockAIEngine.summarize(text) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ai-engine:classify', async (event, content) => {
    try {
      return { success: true, data: await mockAIEngine.classify(content) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ai-engine:enhance', async (event, text) => {
    try {
      return { success: true, data: await mockAIEngine.enhance(text) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Classifier
  ipcMain.handle('classifier:classify', async (event, content, options) => {
    try {
      return { success: true, data: await mockClassifier.classify(content) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('classifier:getStats', async () => {
    try {
      return { 
        success: true, 
        data: { 
          totalClassifications: 150,
          averageConfidence: 0.87,
          cacheHits: 45,
        } 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Summarizer
  ipcMain.handle('summarizer:summarize', async (event, content, options) => {
    try {
      return { success: true, data: await mockSummarizer.summarize(content, options) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('summarizer:getCacheStats', async () => {
    try {
      return { 
        success: true, 
        data: { 
          size: 42,
          hitRate: 0.65,
        } 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('✅ AI Services IPC handlers registered');
}

module.exports = { registerAIServicesIPC };
