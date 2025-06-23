/**
 * Validadores para el modelo de suscripciones
 * Centraliza toda la lógica de validación de datos de suscripciones
 */

import { body, param, query } from 'express-validator';

/**
 * Validaciones para crear una nueva suscripción
 */
export const createSubscriptionValidators = [    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d10-9\s\-_.&()[\]]+$/)
        .withMessage('El nombre contiene caracteres no válidos'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar los 500 caracteres'),

    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0')
        .custom((value) => {
            // Validar que tenga máximo 2 decimales
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 2) {
                throw new Error('El precio no puede tener más de 2 decimales');
            }
            return true;
        }),

    body('currency')
        .isIn(['USD', 'EUR', 'MXN', 'ARS', 'COP', 'PEN', 'CLP'])
        .withMessage('Moneda no válida'),

    body('frequency')
        .isIn(['diaria', 'semanal', 'mensual', 'anual'])
        .withMessage('Frecuencia no válida'),

    body('category')
        .optional()
        .isIn(['streaming', 'software', 'gaming', 'educacion', 'productividad', 'salud', 'finanzas', 'otro'])
        .withMessage('Categoría no válida'),

    body('startDate')
        .isISO8601()
        .withMessage('Fecha de inicio debe ser una fecha válida'),

    body('renewalDate')
        .isISO8601()
        .withMessage('Fecha de renovación debe ser una fecha válida')
        .custom((value, { req }) => {
            const startDate = new Date(req.body.startDate);
            const renewalDate = new Date(value);
            
            if (renewalDate <= startDate) {
                throw new Error('La fecha de renovación debe ser posterior a la fecha de inicio');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['activa', 'cancelada', 'pendiente', 'expirada'])
        .withMessage('Estado no válido'),

    body('website')
        .optional()
        .isURL({ require_protocol: true })
        .withMessage('El sitio web debe ser una URL válida'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden superar los 1000 caracteres')
];

/**
 * Validaciones para actualizar una suscripción
 */
export const updateSubscriptionValidators = [
    param('id')
        .isMongoId()
        .withMessage('ID de suscripción no válido'),    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d10-9\s\-_.&()[\]]+$/)
        .withMessage('El nombre contiene caracteres no válidos'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar los 500 caracteres'),

    body('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser mayor a 0')
        .custom((value) => {
            if (value !== undefined) {
                const decimals = value.toString().split('.')[1];
                if (decimals && decimals.length > 2) {
                    throw new Error('El precio no puede tener más de 2 decimales');
                }
            }
            return true;
        }),

    body('currency')
        .optional()
        .isIn(['USD', 'EUR', 'MXN', 'ARS', 'COP', 'PEN', 'CLP'])
        .withMessage('Moneda no válida'),

    body('frequency')
        .optional()
        .isIn(['diaria', 'semanal', 'mensual', 'anual'])
        .withMessage('Frecuencia no válida'),

    body('category')
        .optional()
        .isIn(['streaming', 'software', 'gaming', 'educacion', 'productividad', 'salud', 'finanzas', 'otro'])
        .withMessage('Categoría no válida'),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser una fecha válida'),

    body('renewalDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de renovación debe ser una fecha válida')
        .custom((value, { req }) => {
            if (value && req.body.startDate) {
                const startDate = new Date(req.body.startDate);
                const renewalDate = new Date(value);
                
                if (renewalDate <= startDate) {
                    throw new Error('La fecha de renovación debe ser posterior a la fecha de inicio');
                }
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['activa', 'cancelada', 'pendiente', 'expirada'])
        .withMessage('Estado no válido'),

    body('website')
        .optional()
        .isURL({ require_protocol: true })
        .withMessage('El sitio web debe ser una URL válida'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden superar los 1000 caracteres')
];

/**
 * Validación para parámetros de ID de suscripción
 */
export const subscriptionIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID de suscripción no válido')
];

/**
 * Validación para parámetros de ID de usuario
 */
export const userIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID de usuario no válido')
];

/**
 * Validaciones para consultas de filtrado y paginación
 */
export const queryValidators = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),

    query('status')
        .optional()
        .isIn(['activa', 'cancelada', 'pendiente', 'expirada'])
        .withMessage('Estado no válido'),

    query('category')
        .optional()
        .isIn(['streaming', 'software', 'gaming', 'educacion', 'productividad', 'salud', 'finanzas', 'otro'])
        .withMessage('Categoría no válida'),

    query('frequency')
        .optional()
        .isIn(['diaria', 'semanal', 'mensual', 'anual'])
        .withMessage('Frecuencia no válida'),

    query('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Los días deben ser un número entre 1 y 365')
];

/**
 * Validaciones para búsqueda de suscripciones
 */
export const searchValidators = [    query('q')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d10-9\s\-_.&()[\]]+$/)
        .withMessage('El término de búsqueda contiene caracteres no válidos'),

    ...queryValidators
];
