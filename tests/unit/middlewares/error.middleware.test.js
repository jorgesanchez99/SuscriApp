import errorMiddleware from '../../../middlewares/error.middleware.js';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = originalConsoleError;
});

describe('Error Middleware - Real Unit Tests', () => {
    let req, res, next, err;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        err = {};
        jest.clearAllMocks();
    });

    describe('errorMiddleware', () => {
        it('should handle generic error with default 500 status and message', () => {
            // Arrange
            err = new Error('Generic error');

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(console.error).toHaveBeenCalledWith("🔴 Error capturado:", err);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Generic error',
                    statusCode: 500
                }
            });
        });

        it('should handle error with custom statusCode and message', () => {
            // Arrange
            err = new Error('Custom error message');
            err.statusCode = 404;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Custom error message',
                    statusCode: 404
                }
            });
        });

        it('should handle error without message (use default)', () => {
            // Arrange
            err = { statusCode: 403 }; // Error without message

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Error interno del servidor',
                    statusCode: 403
                }
            });
        });

        it('should handle CastError (invalid MongoDB ObjectId)', () => {
            // Arrange
            err = new Error('Cast to ObjectId failed');
            err.name = 'CastError';

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'ID de recurso no válido o inexistente.',
                    statusCode: 400
                }
            });
        });

        it('should handle CastError with custom statusCode (statusCode gets overridden)', () => {
            // Arrange
            err = new Error('Cast error');
            err.name = 'CastError';
            err.statusCode = 422;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400); // Should be 400, not 422
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'ID de recurso no válido o inexistente.',
                    statusCode: 400
                }
            });
        });

        it('should handle duplicate key error (MongoDB 11000)', () => {
            // Arrange
            err = new Error('E11000 duplicate key error');
            err.code = 11000;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Ya existe un registro con los datos ingresados.',
                    statusCode: 409
                }
            });
        });

        it('should handle duplicate key error with custom statusCode (gets overridden)', () => {
            // Arrange
            err = new Error('Duplicate key');
            err.code = 11000;
            err.statusCode = 400;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(409); // Should be 409, not 400
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Ya existe un registro con los datos ingresados.',
                    statusCode: 409
                }
            });
        });

        it('should handle ValidationError with single field error', () => {
            // Arrange
            err = new Error('Validation failed');
            err.name = 'ValidationError';
            err.errors = {
                email: {
                    message: 'Email is required'
                }
            };

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Email is required',
                    statusCode: 400
                }
            });
        });

        it('should handle ValidationError with multiple field errors', () => {
            // Arrange
            err = new Error('Validation failed');
            err.name = 'ValidationError';
            err.errors = {
                email: {
                    message: 'Email is required'
                },
                password: {
                    message: 'Password must be at least 6 characters'
                },
                name: {
                    message: 'Name is required'
                }
            };

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Email is required, Password must be at least 6 characters, Name is required',
                    statusCode: 400
                }
            });
        });

        it('should handle ValidationError with custom statusCode (gets overridden)', () => {
            // Arrange
            err = new Error('Validation failed');
            err.name = 'ValidationError';
            err.statusCode = 422;
            err.errors = {
                email: {
                    message: 'Invalid email format'
                }
            };

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400); // Should be 400, not 422
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Invalid email format',
                    statusCode: 400
                }
            });
        });

        it('should handle error with empty message string', () => {
            // Arrange
            err = new Error('');
            err.statusCode = 401;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Error interno del servidor', // Should use default message
                    statusCode: 401
                }
            });
        });

        it('should handle error with zero statusCode (use default 500)', () => {
            // Arrange
            err = new Error('Error with zero status');
            err.statusCode = 0;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500); // Should use default 500
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Error with zero status',
                    statusCode: 500
                }
            });
        });

        it('should prioritize specific error types over custom statusCode (CastError case)', () => {
            // Arrange
            err = new Error('Cast error with custom status');
            err.name = 'CastError';
            err.statusCode = 500;

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400); // CastError should override to 400
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'ID de recurso no válido o inexistente.',
                    statusCode: 400
                }
            });
        });

        it('should handle complex error object without standard properties', () => {
            // Arrange
            err = {
                customProperty: 'custom value',
                // No name, message, statusCode, or code
            };

            // Act
            errorMiddleware(err, req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Error interno del servidor',
                    statusCode: 500
                }
            });
        });
    });
});
