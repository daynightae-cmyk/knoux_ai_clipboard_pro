// Test setup for Knoux Clipboard AI
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';

(globalThis as any).jest = vi;

// Mock Electron APIs
global.window.knoux = {
  // App lifecycle
  isAppReady: vi.fn(() => true),
  onAppReady: vi.fn((callback) => callback()),
  quitApp: vi.fn(() => Promise.resolve({ success: true })),
  restartApp: vi.fn(() => Promise.resolve({ success: true })),
  
  // Settings
  getSettings: vi.fn(() => Promise.resolve({
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
  saveSettings: vi.fn(() => Promise.resolve({ success: true })),
  resetSettings: vi.fn(() => Promise.resolve({ success: true })),
  
  // Clipboard
  getClipboardHistory: vi.fn(() => Promise.resolve({
    success: true,
    data: [],
    total: 0
  })),
  clearClipboardHistory: vi.fn(() => Promise.resolve({
    success: true,
    deletedCount: 0
  })),
  copyToClipboard: vi.fn(() => Promise.resolve({ success: true })),
  getCurrentClipboard: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      id: 'test-id',
      content: 'Test content',
      format: 'text',
      timestamp: new Date().toISOString()
    }
  })),
  
  // AI
  getAIStatus: vi.fn(() => Promise.resolve({
    success: true,
    data: { status: 'ready', model: 'test-model' }
  })),
  processWithAI: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      content: 'Processed content',
      metadata: { processingTime: 100, confidence: 0.9 }
    }
  })),
  
  // System
  openDevTools: vi.fn(),
  showNotification: vi.fn(() => Promise.resolve({ success: true })),
  getSystemInfo: vi.fn(() => Promise.resolve({
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
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock crypto
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: vi.fn(arr => arr),
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn()
    }
  }
});

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('Test clipboard content'))
  }
});

// Add TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock console for cleaner tests
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
};

// Test timeout
vi.setConfig({ testTimeout: 10000 });

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
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
