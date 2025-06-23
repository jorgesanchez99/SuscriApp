// Configuración global para todas las pruebas
import 'jest-extended';

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = '5fe762ca518800d7b49aefedba4f26f340c7f535d331601ef542da8d5d4481763768347c725d6194fb325521e9fe4eb83ebd849000ef5510395cc1b0d9025acd';
process.env.MONGODB_URI = 'mongodb://localhost/suscripcion-tracker-test';
process.env.DB_URI = 'mongodb://localhost/suscripcion-tracker-test';
process.env.ARCJET_KEY = 'ajkey_test_fake_key_for_testing_purposes_only_not_real';
process.env.JWT_EXPIRATION = '24h';

// Configuración global
global.testConfig = {
  jwt_secret: '5fe762ca518800d7b49aefedba4f26f340c7f535d331601ef542da8d5d4481763768347c725d6194fb325521e9fe4eb83ebd849000ef5510395cc1b0d9025acd',
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
