// Test setup for Knoux Clipboard AI
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Electron APIs
global.window.knoux = {
  // App lifecycle
  isAppReady: jest.fn(() => true),
  onAppReady: jest.fn((callback) => callback()),
  quitApp: jest.fn(() => Promise.resolve({ success: true })),
  restartApp: jest.fn(() => Promise.resolve({ success: true })),
  
  // Settings
  getSettings: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      theme: 'dark',
      language: 'en',
      autoStart: true,
      pollInterval: 500,
      maxHistoryItems: 1000,
      aiEnabled: true,
      encryptSensitive: true
    }
  })),
  saveSettings: jest.fn(() => Promise.resolve({ success: true })),
  resetSettings: jest.fn(() => Promise.resolve({ success: true })),
  
  // Clipboard
  getClipboardHistory: jest.fn(() => Promise.resolve({
    success: true,
    data: [],
    total: 0
  })),
  clearClipboardHistory: jest.fn(() => Promise.resolve({
    success: true,
    deletedCount: 0
  })),
  copyToClipboard: jest.fn(() => Promise.resolve({ success: true })),
  getCurrentClipboard: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      id: 'test-id',
      content: 'Test content',
      format: 'text',
      timestamp: new Date().toISOString()
    }
  })),
  
  // AI
  getAIStatus: jest.fn(() => Promise.resolve({
    success: true,
    data: { status: 'ready', model: 'test-model' }
  })),
  processWithAI: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      content: 'Processed content',
      metadata: { processingTime: 100, confidence: 0.9 }
    }
  })),
  
  // System
  openDevTools: jest.fn(),
  showNotification: jest.fn(() => Promise.resolve({ success: true })),
  getSystemInfo: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      platform: 'win32',
      arch: 'x64',
      version: '1.0.0',
      memory: { total: 8000, free: 4000 }
    }
  }))
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock crypto
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: jest.fn(arr => arr),
    subtle: {
      digest: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn()
    }
  }
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('Test clipboard content'))
  }
});

// Add TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console for cleaner tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Test timeout
jest.setTimeout(10000);

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockClipboardItem: (overrides = {}) => ({
    id: 'test-' + Date.now(),
    content: 'Test clipboard content',
    format: 'text',
    timestamp: new Date().toISOString(),
    metadata: { source: 'test', length: 23 },
    tags: ['test'],
    ...overrides
  }),
  mockAIResponse: (overrides = {}) => ({
    success: true,
    data: {
      content: 'AI processed content',
      operation: 'enhance',
      metadata: { model: 'test-model', confidence: 0.9 },
      ...overrides.data
    },
    ...overrides
  })
};
