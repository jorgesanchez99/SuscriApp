// Prueba básica para verificar que Jest funciona
const { describe, test, expect } = require('@jest/globals');

describe('Basic Test Suite', () => {
  test('should verify Jest is working', () => {
    expect(true).toBe(true);
  });

  test('should verify environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBe('test-jwt-secret-key-for-testing-only');
  });

  test('should perform basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(8 / 2).toBe(4);
  });

  test('should work with arrays', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray).toHaveLength(5);
    expect(testArray).toContain(3);
    expect(testArray[0]).toBe(1);
  });

  test('should work with objects', () => {
    const testObj = {
      name: 'Test',
      value: 42,
      active: true
    };
    
    expect(testObj).toHaveProperty('name', 'Test');
    expect(testObj).toHaveProperty('value', 42);
    expect(testObj.active).toBe(true);
  });
});
