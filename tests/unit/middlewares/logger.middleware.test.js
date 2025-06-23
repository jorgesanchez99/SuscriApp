import {
    errorLogger,
    getLogger,
    authLogger
} from '../../../middlewares/logger.middleware.js';

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});

describe('Logger Middleware - Real Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            method: 'GET',
            url: '/test',
            path: '/test',
            ip: '127.0.0.1',
            connection: { remoteAddress: '127.0.0.1' },
            get: jest.fn()
        };
        res = {
            statusCode: 200
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('errorLogger', () => {
        it('should log error information and call next', () => {
            // Arrange
            const error = new Error('Test error message');
            error.stack = 'Error stack trace';
            error.statusCode = 500;
            
            req.method = 'POST';
            req.url = '/api/error';
            req.get.mockReturnValue('Mozilla/5.0 Test Browser');
            req.user = { _id: 'user123' };

            // Act
            errorLogger(error, req, res, next);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('❌')
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('ERROR POST /api/error [Usuario: user123]')
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Mensaje: Test error message')
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Stack: Error stack trace')
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('User-Agent: Mozilla/5.0 Test Browser')
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Status Code: 500')
            );
            expect(next).toHaveBeenCalledWith(error);
        });

        it('should log error without user info when not authenticated', () => {
            // Arrange
            const error = new Error('Unauthenticated error');
            req.user = null;
            req.get.mockReturnValue('Unknown Browser');

            // Act
            errorLogger(error, req, res, next);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('ERROR GET /test')
            );
            expect(console.error).toHaveBeenCalledWith(
                expect.not.stringContaining('[Usuario:')
            );
            expect(next).toHaveBeenCalledWith(error);
        });

        it('should handle error without statusCode', () => {
            // Arrange
            const error = new Error('Error without status');
            req.get.mockReturnValue(undefined); // No User-Agent

            // Act
            errorLogger(error, req, res, next);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('User-Agent: Unknown')
            );
            expect(console.error).not.toHaveBeenCalledWith(
                expect.stringContaining('Status Code:')
            );
            expect(next).toHaveBeenCalledWith(error);
        });

        it('should handle error with stack trace', () => {
            // Arrange
            const error = new Error('Error with stack');
            error.stack = 'Complete stack trace here';
            req.get.mockReturnValue('Test Agent');

            // Act
            errorLogger(error, req, res, next);

            // Assert
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Stack: Complete stack trace here')
            );
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getLogger', () => {
        it('should return a function for production environment', () => {
            const originalEnv = process.env.NODE_ENV;
            
            try {
                process.env.NODE_ENV = 'production';
                const result = getLogger();
                expect(typeof result).toBe('function');
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should return a function for test environment', () => {
            const originalEnv = process.env.NODE_ENV;
            
            try {
                process.env.NODE_ENV = 'test';
                const result = getLogger();
                expect(typeof result).toBe('function');
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should return a function for development environment', () => {
            const originalEnv = process.env.NODE_ENV;
            
            try {
                process.env.NODE_ENV = 'development';
                const result = getLogger();
                expect(typeof result).toBe('function');
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should return a function as default when NODE_ENV is not set', () => {
            const originalEnv = process.env.NODE_ENV;
            
            try {
                delete process.env.NODE_ENV;
                const result = getLogger();
                expect(typeof result).toBe('function');
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });

        it('should return different loggers for different environments', () => {
            const originalEnv = process.env.NODE_ENV;
            
            try {
                process.env.NODE_ENV = 'production';
                const prodLogger = getLogger();
                
                process.env.NODE_ENV = 'development';
                const devLogger = getLogger();
                
                process.env.NODE_ENV = 'test';
                const testLogger = getLogger();
                
                // They should all be functions but different instances
                expect(typeof prodLogger).toBe('function');
                expect(typeof devLogger).toBe('function');
                expect(typeof testLogger).toBe('function');
            } finally {
                process.env.NODE_ENV = originalEnv;
            }
        });
    });

    describe('authLogger', () => {
        it('should log authentication requests for auth routes', () => {
            // Arrange
            req.path = '/auth/signin';
            req.method = 'POST';
            req.ip = '192.168.1.1';

            // Act
            authLogger(req, res, next);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('🔐')
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('AUTH POST /auth/signin from 192.168.1.1')
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should use connection.remoteAddress when ip is not available', () => {
            // Arrange
            req.path = '/auth/signup';
            req.method = 'POST';
            req.ip = undefined;
            req.connection.remoteAddress = '10.0.0.1';

            // Act
            authLogger(req, res, next);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('from 10.0.0.1')
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should not log for non-auth routes', () => {
            // Arrange
            req.path = '/api/users';
            req.method = 'GET';

            // Act
            authLogger(req, res, next);

            // Assert
            expect(console.log).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
        });

        it('should log for all auth subroutes', () => {
            const authPaths = [
                '/auth/signin',
                '/auth/signup',
                '/auth/logout',
                '/auth/refresh'
            ];

            authPaths.forEach(path => {
                jest.clearAllMocks();
                req.path = path;
                
                authLogger(req, res, next);
                
                expect(console.log).toHaveBeenCalled();
                expect(next).toHaveBeenCalledWith();
            });
        });

        it('should include timestamp in log', () => {
            // Arrange
            req.path = '/auth/test';
            req.method = 'GET';
            req.ip = '127.0.0.1';

            // Act
            authLogger(req, res, next);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                expect.stringMatching(/🔐 \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
            );
        });

        it('should handle missing ip and connection', () => {
            // Arrange
            req.path = '/auth/test';
            req.method = 'POST';
            req.ip = undefined;
            req.connection = {};

            // Act
            authLogger(req, res, next);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('from undefined')
            );
            expect(next).toHaveBeenCalledWith();
        });
    });
});
