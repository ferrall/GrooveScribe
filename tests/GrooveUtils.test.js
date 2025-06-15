/**
 * Tests for GrooveUtils module
 */

import { GrooveUtils } from '../js/modules/GrooveUtils.js';

describe('GrooveUtils', () => {
  let grooveUtils;

  beforeEach(() => {
    grooveUtils = new GrooveUtils();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(grooveUtils.abc_obj).toBeNull();
      expect(grooveUtils.note_mapping_array).toBeNull();
      expect(grooveUtils.debugMode).toBe(false);
      expect(grooveUtils.viewMode).toBe(true);
      expect(grooveUtils.grooveDBAuthoring).toBe(false);
      expect(grooveUtils.isMIDIPaused).toBe(false);
      expect(grooveUtils.shouldMIDIRepeat).toBe(true);
      expect(grooveUtils.swingIsEnabled).toBe(false);
    });

    test('should have a unique index', () => {
      const utils1 = new GrooveUtils();
      const utils2 = new GrooveUtils();
      expect(utils1.grooveUtilsUniqueIndex).not.toBe(utils2.grooveUtilsUniqueIndex);
    });
  });

  describe('getQueryVariableFromURL', () => {
    test('should return default value when parameter not found', () => {
      // Mock window.location.search
      delete window.location;
      window.location = { search: '' };
      
      const result = grooveUtils.getQueryVariableFromURL('nonexistent', 'default');
      expect(result).toBe('default');
    });

    test('should return parameter value when found', () => {
      delete window.location;
      window.location = { search: '?tempo=120&div=16' };
      
      const result = grooveUtils.getQueryVariableFromURL('tempo', '80');
      expect(result).toBe('120');
    });

    test('should return empty string as default when no default provided', () => {
      delete window.location;
      window.location = { search: '' };
      
      const result = grooveUtils.getQueryVariableFromURL('missing');
      expect(result).toBe('');
    });
  });

  describe('device detection', () => {
    test('isTouchDevice should detect touch capability', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true
      });
      
      expect(grooveUtils.isTouchDevice()).toBe(true);
      
      // Remove touch support
      delete window.ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true
      });
      
      expect(grooveUtils.isTouchDevice()).toBe(false);
    });

    test('isMobileDevice should detect mobile user agents', () => {
      const originalUserAgent = navigator.userAgent;
      
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true
      });
      
      expect(grooveUtils.isMobileDevice()).toBe(true);
      
      // Mock desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true
      });
      
      expect(grooveUtils.isMobileDevice()).toBe(false);
      
      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true
      });
    });
  });

  describe('localStorage methods', () => {
    test('saveToLocalStorage should save data successfully', () => {
      const testData = { tempo: 120, swing: 0 };
      const result = grooveUtils.saveToLocalStorage('test-key', testData);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    test('saveToLocalStorage should handle errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      const result = grooveUtils.saveToLocalStorage('test-key', {});
      expect(result).toBe(false);
    });

    test('loadFromLocalStorage should load data successfully', () => {
      const testData = { tempo: 120, swing: 0 };
      localStorage.getItem.mockReturnValue(JSON.stringify(testData));
      
      const result = grooveUtils.loadFromLocalStorage('test-key');
      expect(result).toEqual(testData);
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    test('loadFromLocalStorage should return default value when key not found', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const defaultValue = { tempo: 80 };
      const result = grooveUtils.loadFromLocalStorage('missing-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('loadFromLocalStorage should handle JSON parse errors', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const defaultValue = { tempo: 80 };
      const result = grooveUtils.loadFromLocalStorage('test-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('createElement utility', () => {
    test('should create element with basic attributes', () => {
      const element = grooveUtils.createElement('div', {
        className: 'test-class',
        id: 'test-id',
        textContent: 'Test content'
      });
      
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('test-class');
      expect(element.id).toBe('test-id');
      expect(element.textContent).toBe('Test content');
    });

    test('should create element with data attributes', () => {
      const element = grooveUtils.createElement('div', {
        'data-test': 'value',
        'data-number': '123'
      });
      
      expect(element.getAttribute('data-test')).toBe('value');
      expect(element.getAttribute('data-number')).toBe('123');
    });

    test('should create element with children', () => {
      const child1 = document.createElement('span');
      child1.textContent = 'Child 1';
      
      const element = grooveUtils.createElement('div', {}, [
        'Text node',
        child1,
        'Another text node'
      ]);
      
      expect(element.children.length).toBe(1);
      expect(element.textContent).toContain('Text node');
      expect(element.textContent).toContain('Child 1');
      expect(element.textContent).toContain('Another text node');
    });
  });

  describe('event handling utilities', () => {
    test('addEventListenerSafe should add event listener', () => {
      const element = document.createElement('button');
      const handler = jest.fn();
      
      const removeListener = grooveUtils.addEventListenerSafe(element, 'click', handler);
      
      // Simulate click
      element.click();
      expect(handler).toHaveBeenCalled();
      
      // Test removal
      expect(typeof removeListener).toBe('function');
    });

    test('addEventListenerSafe should handle null element gracefully', () => {
      const handler = jest.fn();
      const removeListener = grooveUtils.addEventListenerSafe(null, 'click', handler);
      
      expect(typeof removeListener).toBe('function');
      expect(() => removeListener()).not.toThrow();
    });
  });

  describe('utility functions', () => {
    test('debounce should delay function execution', (done) => {
      const mockFn = jest.fn();
      const debouncedFn = grooveUtils.debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    test('throttle should limit function execution', (done) => {
      const mockFn = jest.fn();
      const throttledFn = grooveUtils.throttle(mockFn, 100);
      
      throttledFn();
      throttledFn();
      throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      setTimeout(() => {
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
        done();
      }, 150);
    });
  });

  describe('error handling', () => {
    test('handleError should log error and show notification', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const showNotificationSpy = jest.spyOn(grooveUtils, 'showNotification').mockImplementation();
      
      const error = new Error('Test error');
      grooveUtils.handleError(error, 'Test context');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error in Test context:', error);
      expect(showNotificationSpy).toHaveBeenCalledWith('An error occurred: Test error', 'error');
      
      consoleSpy.mockRestore();
      showNotificationSpy.mockRestore();
    });
  });
});
