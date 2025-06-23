export default {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Archivos de configuración que se ejecutan antes de las pruebas
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Patrones para encontrar archivos de prueba
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.OLD/'
  ],
    // Soporte para módulos ES6
  transform: {},
  // extensionsToTreatAsEsm: ['.js'], // Removido porque se infiere automáticamente
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Cobertura de código
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middlewares/**/*.js',
    'validators/**/*.js',
    'models/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Formato de reportes de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Directorio para reportes de cobertura
  coverageDirectory: 'coverage',
  
  // Variables de entorno para testing
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Timeout para pruebas (30 segundos)
  testTimeout: 30000,
  
  // Limpiar mocks después de cada prueba
  clearMocks: true,
  
  // Restablecer módulos después de cada prueba
  resetModules: true
};
