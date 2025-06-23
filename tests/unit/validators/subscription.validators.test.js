import { validationResult } from 'express-validator';
import {
  createSubscriptionValidators,
  updateSubscriptionValidators,
  subscriptionIdValidator
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
          startDate: '2024-01-01',
          renewalDate: '2024-02-01',
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
          startDate: '2024-01-01',
          renewalDate: '2024-02-01'
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
          startDate: '2024-01-01',
          renewalDate: '2024-02-01'
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

    test('should reject subscription with invalid currency', async () => {
      const invalidData = {
        body: {
          name: 'Netflix Premium',
          price: 15.99,
          currency: 'XYZ', // Moneda inválida
          frequency: 'mensual',
          startDate: '2024-01-01',
          renewalDate: '2024-02-01'
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
          startDate: '2024-01-01',
          renewalDate: '2024-02-01'
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
});