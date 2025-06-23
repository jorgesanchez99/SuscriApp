import { handleValidationErrors, validate } from '../../../middlewares/validation.middleware.js';
import { validationResult } from 'express-validator';

// Mock express-validator
jest.mock('express-validator');

describe('Validation Middleware - Real Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('handleValidationErrors', () => {
        it('should call next() when validation passes (no errors)', () => {
            // Arrange
            const mockValidationResult = {
                isEmpty: jest.fn().mockReturnValue(true),
                array: jest.fn()
            };
            validationResult.mockReturnValue(mockValidationResult);

            // Act
            handleValidationErrors(req, res, next);

            // Assert
            expect(validationResult).toHaveBeenCalledWith(req);
            expect(mockValidationResult.isEmpty).toHaveBeenCalled();
            expect(mockValidationResult.array).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should return 400 error when validation fails with single error', () => {
            // Arrange
            const validationErrors = [
                {
                    path: 'email',
                    msg: 'Email is required',
                    value: ''
                }
            ];

            const mockValidationResult = {
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue(validationErrors)
            };
            validationResult.mockReturnValue(mockValidationResult);

            // Act
            handleValidationErrors(req, res, next);

            // Assert
            expect(validationResult).toHaveBeenCalledWith(req);
            expect(mockValidationResult.isEmpty).toHaveBeenCalled();
            expect(mockValidationResult.array).toHaveBeenCalled();
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "Errores de validación en los datos enviados",
                    statusCode: 400,
                    details: [
                        {
                            field: 'email',
                            message: 'Email is required',
                            value: ''
                        }
                    ]
                }
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 400 error when validation fails with multiple errors', () => {
            // Arrange
            const validationErrors = [
                {
                    path: 'email',
                    msg: 'Email is required',
                    value: ''
                },
                {
                    path: 'password',
                    msg: 'Password must be at least 6 characters',
                    value: '123'
                },
                {
                    path: 'name',
                    msg: 'Name is required',
                    value: undefined
                }
            ];

            const mockValidationResult = {
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue(validationErrors)
            };
            validationResult.mockReturnValue(mockValidationResult);

            // Act
            handleValidationErrors(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "Errores de validación en los datos enviados",
                    statusCode: 400,
                    details: [
                        {
                            field: 'email',
                            message: 'Email is required',
                            value: ''
                        },
                        {
                            field: 'password',
                            message: 'Password must be at least 6 characters',
                            value: '123'
                        },
                        {
                            field: 'name',
                            message: 'Name is required',
                            value: undefined
                        }
                    ]
                }
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle errors without path field (use param field)', () => {
            // Arrange
            const validationErrors = [
                {
                    param: 'id', // older express-validator format
                    msg: 'ID must be valid',
                    value: 'invalid-id'
                }
            ];

            const mockValidationResult = {
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue(validationErrors)
            };
            validationResult.mockReturnValue(mockValidationResult);

            // Act
            handleValidationErrors(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "Errores de validación en los datos enviados",
                    statusCode: 400,
                    details: [
                        {
                            field: 'id',
                            message: 'ID must be valid',
                            value: 'invalid-id'
                        }
                    ]
                }
            });
        });

        it('should handle errors without path or param field', () => {
            // Arrange
            const validationErrors = [
                {
                    msg: 'General validation error',
                    value: null
                }
            ];

            const mockValidationResult = {
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue(validationErrors)
            };
            validationResult.mockReturnValue(mockValidationResult);

            // Act
            handleValidationErrors(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "Errores de validación en los datos enviados",
                    statusCode: 400,
                    details: [
                        {
                            field: undefined,
                            message: 'General validation error',
                            value: null
                        }
                    ]
                }
            });
        });

        it('should handle empty validation errors array', () => {
            // Arrange
            const mockValidationResult = {
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue([])
            };
            validationResult.mockReturnValue(mockValidationResult);

            // Act
            handleValidationErrors(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "Errores de validación en los datos enviados",
                    statusCode: 400,
                    details: []
                }
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validate helper function', () => {
        it('should return array with validators and handleValidationErrors', () => {
            // Arrange
            const mockValidator1 = jest.fn();
            const mockValidator2 = jest.fn();
            const validators = [mockValidator1, mockValidator2];

            // Act
            const result = validate(validators);

            // Assert
            expect(result).toHaveLength(3);
            expect(result[0]).toBe(mockValidator1);
            expect(result[1]).toBe(mockValidator2);
            expect(result[2]).toBe(handleValidationErrors);
        });

        it('should handle empty validators array', () => {
            // Arrange
            const validators = [];

            // Act
            const result = validate(validators);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toBe(handleValidationErrors);
        });

        it('should handle single validator', () => {
            // Arrange
            const mockValidator = jest.fn();
            const validators = [mockValidator];

            // Act
            const result = validate(validators);

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]).toBe(mockValidator);
            expect(result[1]).toBe(handleValidationErrors);
        });
    });
});
