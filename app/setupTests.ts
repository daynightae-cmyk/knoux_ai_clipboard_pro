// Jest setup file for Knoux Clipboard AI
// This file runs before each test file

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Electron APIs
const mockElectronAPI = {
  isAppReady: jest.fn(() => true),
  onAppReady: jest.fn((callback) => callback()),
  getSettings: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      theme: 'dark',
      language: 'en',
      autoStart: true,
    },
  })),
  saveSettings: jest.fn(() => Promise.resolve({ success: true })),
  getClipboardHistory: jest.fn(() => Promise.resolve({
    success: true,
    data: [],
    total: 0,
  })),
  processWithAI: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      content: 'Processed content',
      metadata: {},
    },
  })),
  showNotification: jest.fn(() => Promise.resolve({ success: true })),
  openDevTools: jest.fn(),
  quitApp: jest.fn(() => Promise.resolve({ success: true })),
  restartApp: jest.fn(() => Promise.resolve({ success: true })),
};

// Mock window.knoux
Object.defineProperty(window, 'knoux', {
  value: mockElectronAPI,
  writable: true,
});

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
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock crypto API for testing
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    },
  },
});

// Add TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('Mock clipboard content')),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock indexedDB for tests
const indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};
Object.defineProperty(window, 'indexedDB', { value: indexedDB });

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(() => callback(Date.now()), 0);
};
global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  },
});

// Set test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Reset all mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});

// Global test utilities
global.testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockClipboardItem: (overrides = {}) => ({
    id: 'test-id-' + Date.now(),
    content: 'Test clipboard content',
    format: 'text',
    timestamp: new Date().toISOString(),
    metadata: {
      source: 'test',
      length: 23,
      language: 'plaintext',
    },
    tags: ['test'],
    ...overrides,
  }),
  mockAIResponse: (overrides = {}) => ({
    success: true,
    data: {
      content: 'AI processed content',
      operation: 'enhance',
      metadata: {
        model: 'test-model',
        processingTime: 100,
        confidence: 0.9,
      },
      suggestions: [],
      ...overrides.data,
    },
    ...overrides,
  }),
};
