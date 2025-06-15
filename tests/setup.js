/**
 * Jest test setup file
 * Global test configuration and mocks
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createBufferSource: jest.fn(),
  createGain: jest.fn(),
  createBuffer: jest.fn(),
  decodeAudioData: jest.fn(),
  resume: jest.fn().mockResolvedValue(),
  close: jest.fn().mockResolvedValue(),
  state: 'running',
  currentTime: 0,
  destination: {}
}));

global.webkitAudioContext = global.AudioContext;

// Mock URL and URLSearchParams
global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
};

global.URLSearchParams = jest.fn().mockImplementation((search) => {
  const params = new Map();
  if (search) {
    search.replace(/^\?/, '').split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        params.set(key, decodeURIComponent(value || ''));
      }
    });
  }
  
  return {
    get: (key) => params.get(key),
    set: (key, value) => params.set(key, value),
    has: (key) => params.has(key),
    delete: (key) => params.delete(key),
    toString: () => {
      const pairs = [];
      params.forEach((value, key) => {
        pairs.push(`${key}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

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

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  fetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0))
  });
});

afterEach(() => {
  // Clean up after each test
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Suppress console errors/warnings in tests unless explicitly testing them
global.suppressConsole = () => {
  console.error = jest.fn();
  console.warn = jest.fn();
};

global.restoreConsole = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
};

// Helper function to create DOM elements for testing
global.createTestElement = (tag, attributes = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  return element;
};

// Helper function to wait for async operations
global.waitFor = (condition, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
};
