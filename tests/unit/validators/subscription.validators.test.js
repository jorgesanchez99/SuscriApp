import { validationResult } from 'express-validator';
import {
  createSubscriptionValidators,
  updateSubscriptionValidators,
  subscriptionIdValidator,
  userIdValidator,
  queryValidators,
  searchValidators
} from '../../../validators/subscription.validators.js';

/**
 * Helper para ejecutar validaciones
 * @param {Array} validatorList - Lista de validadores de express-validator
 * @param {Object} reqData - Datos de la request (body, params, query)
 * @returns {Object} Resultado de la validación con errores
 */
async function validateRequest(validatorList, reqData) {
  const req = {
    body: reqData.body || {},
    params: reqData.params || {},
    query: reqData.query || {}
  };
  
  // Ejecutar todos los validadores
  for (const validator of validatorList) {
    await validator.run(req);
  }
  
  // Obtener errores
  const errors = validationResult(req);
  return {
    isValid: errors.isEmpty(),
    errors: errors.array()
  };
}

describe('Subscription Validators - Real Unit Tests', () => {
  
  describe('createSubscriptionValidators', () => {
    test('should validate complete valid subscription data', async () => {
      const validData = {
        body: {
          name: 'Netflix Premium',
          description: 'Plan familiar con 4K',
          price: 15.99,
          currency: 'USD',
          frequency: 'mensual',
          category: 'streaming',
          startDate: '2025-06-23',
          renewalDate: '2025-07-23',
          status: 'activa',
          website: 'https://netflix.com',
          notes: 'Cuenta compartida con familia'
        }
      };

      const result = await validateRequest(createSubscriptionValidators, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject subscription with invalid name', async () => {
      const invalidData = {
        body: {
          name: 'A', // Muy corto (min 2 caracteres)
          price: 15.99,
          currency: 'USD',
          frequency: 'mensual',
          startDate: '2025-06-23',
          renewalDate: '2025-07-23'
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'name',
            msg: 'El nombre debe tener entre 2 y 100 caracteres'
          })
        ])
      );
    });

    test('should reject subscription with invalid price', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 0, // Precio inválido (debe ser > 0.01)
          currency: 'USD',
          frequency: 'mensual',
          startDate: '2025-06-23',
          renewalDate: '2025-07-23'
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'price',
            msg: 'El precio debe ser mayor a 0'
          })
        ])
      );
    });

    test('should reject subscription with price having more than 2 decimals', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 15.999, // Más de 2 decimales
          currency: 'USD',
          frequency: 'mensual',
          startDate: '2025-06-23',
          renewalDate: '2025-07-23'
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'price',
            msg: 'El precio no puede tener más de 2 decimales'
          })
        ])
      );
    });

    test('should reject subscription with invalid currency', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 15.99,
          currency: 'XYZ', // Moneda inválida
          frequency: 'mensual',
          startDate: '2025-06-23',
          renewalDate: '2025-07-23'
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'currency',
            msg: 'Moneda no válida'
          })
        ])
      );
    });

    test('should reject subscription with invalid frequency', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 15.99,
          currency: 'USD',
          frequency: 'daily', // Frecuencia inválida
          startDate: '2025-06-23',
          renewalDate: '2025-07-23'
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'frequency',
            msg: 'Frecuencia no válida'
          })
        ])
      );
    });

    test('should reject subscription when renewalDate is before startDate', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 15.99,
          currency: 'USD',
          frequency: 'mensual',
          startDate: '2025-07-23',
          renewalDate: '2025-06-23' // Fecha anterior a startDate
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'renewalDate',
            msg: 'La fecha de renovación debe ser posterior a la fecha de inicio'
          })
        ])
      );
    });

    test('should reject subscription when renewalDate equals startDate', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 15.99,
          currency: 'USD',
          frequency: 'mensual',
          startDate: '2025-06-23',
          renewalDate: '2025-06-23' // Misma fecha
        }
      };

      const result = await validateRequest(createSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'renewalDate',
            msg: 'La fecha de renovación debe ser posterior a la fecha de inicio'
          })
        ])
      );
    });
  });

  describe('subscriptionIdValidator', () => {
    test('should validate valid MongoDB ObjectId', async () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011' // ObjectId válido
        }
      };

      const result = await validateRequest(subscriptionIdValidator, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid MongoDB ObjectId', async () => {
      const invalidData = {
        params: {
          id: 'invalid-id' // ObjectId inválido
        }
      };

      const result = await validateRequest(subscriptionIdValidator, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'ID de suscripción no válido'
          })
        ])
      );
    });
  });

  describe('updateSubscriptionValidators', () => {
    test('should validate partial update data', async () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          name: 'Netflix Updated',
          price: 19.99
        }
      };

      const result = await validateRequest(updateSubscriptionValidators, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid ObjectId in params', async () => {
      const invalidData = {
        params: {
          id: 'invalid-id'
        },
        body: {
          name: 'Netflix Updated'
        }
      };

      const result = await validateRequest(updateSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'ID de suscripción no válido'
          })
        ])
      );
    });

    test('should handle empty body (all fields optional)', async () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {}
      };

      const result = await validateRequest(updateSubscriptionValidators, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject update with price having more than 2 decimals', async () => {
      const invalidData = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          price: 19.999 // Más de 2 decimales
        }
      };

      const result = await validateRequest(updateSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'price',
            msg: 'El precio no puede tener más de 2 decimales'
          })
        ])
      );
    });

    test('should reject update when renewalDate is before startDate', async () => {
      const invalidData = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          startDate: '2025-07-23',
          renewalDate: '2025-06-23' // Fecha anterior a startDate
        }
      };

      const result = await validateRequest(updateSubscriptionValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'renewalDate',
            msg: 'La fecha de renovación debe ser posterior a la fecha de inicio'
          })
        ])
      );
    });

    test('should allow update with only renewalDate when no startDate provided', async () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          renewalDate: '2025-03-01' // Solo renewalDate, sin startDate
        }
      };

      const result = await validateRequest(updateSubscriptionValidators, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('userIdValidator', () => {
    test('should validate valid user ObjectId', async () => {
      const validData = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };

      const result = await validateRequest(userIdValidator, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid user ObjectId', async () => {
      const invalidData = {
        params: {
          id: 'not-valid-objectid'
        }
      };

      const result = await validateRequest(userIdValidator, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'id',
            msg: 'ID de usuario no válido'
          })
        ])
      );
    });
  });

  describe('queryValidators', () => {
    test('should validate valid query parameters', async () => {
      const validData = {
        query: {
          page: '2',
          limit: '20',
          status: 'activa',
          category: 'streaming'
        }
      };

      const result = await validateRequest(queryValidators, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid page parameter', async () => {
      const invalidData = {
        query: {
          page: '0'
        }
      };

      const result = await validateRequest(queryValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'page',
            msg: 'La página debe ser un número entero mayor a 0'
          })
        ])
      );
    });

    test('should reject invalid limit parameter', async () => {
      const invalidData = {
        query: {
          limit: '150'
        }
      };

      const result = await validateRequest(queryValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'limit',
            msg: 'El límite debe ser un número entre 1 y 100'
          })
        ])
      );
    });
  });

  describe('searchValidators', () => {
    test('should validate valid search query', async () => {
      const validData = {
        query: {
          q: 'Netflix',
          page: '1',
          limit: '10'
        }
      };

      const result = await validateRequest(searchValidators, validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject search term too short', async () => {
      const invalidData = {
        query: {
          q: 'N'
        }
      };

      const result = await validateRequest(searchValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'q',
            msg: 'El término de búsqueda debe tener entre 2 y 100 caracteres'
          })
        ])
      );
    });

    test('should reject search term with invalid characters', async () => {
      const invalidData = {
        query: {
          q: 'Netflix<script>'
        }
      };

      const result = await validateRequest(searchValidators, invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'q',
            msg: 'El término de búsqueda contiene caracteres no válidos'
          })
        ])
      );
    });
  });
});