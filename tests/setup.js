// Configuración global para todas las pruebas
require('jest-extended');

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost/suscripcion-tracker-test';

// Configuración global
global.testConfig = {
  jwt_secret: 'test-jwt-secret-key-for-testing-only',
  mongodb_uri: 'mongodb://localhost/suscripcion-tracker-test'
};

// Función helper para crear datos de prueba consistentes
global.createTestData = {
  user: {
    valid: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    },
    admin: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123'
    }
  },
  subscription: {
    valid: {
      name: 'Netflix Premium',
      description: 'Plan familiar con 4K',
      price: 15.99,
      currency: 'USD',
      frequency: 'mensual',
      category: 'streaming',
      startDate: '2024-01-01',
      renewalDate: '2024-02-01',
      website: 'https://netflix.com',
      notes: 'Cuenta compartida con familia'
    },
    minimal: {
      name: 'Basic Service',
      price: 9.99,
      currency: 'USD',
      frequency: 'mensual',
      startDate: '2024-01-01',
      renewalDate: '2024-02-01'
    }
  }
};
