/**
 * Middleware para manejar las validaciones de express-validator
 * Centraliza el manejo de errores de validación
 */

import { validationResult } from 'express-validator';

/**
 * Middleware que verifica los resultados de validación y responde con errores si los hay
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Formatear errores para respuesta más clara
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            error: {
                message: "Errores de validación en los datos enviados",
                statusCode: 400,
                details: formattedErrors
            }
        });
    }
    
    next();
};

/**
 * Función helper para combinar validadores con el middleware de manejo de errores
 * @param {Array} validators - Array de validadores de express-validator
 * @returns {Array} Array de middlewares incluyendo el manejo de errores
 */
export const validate = (validators) => {
    return [...validators, handleValidationErrors];
};

export default handleValidationErrors;
