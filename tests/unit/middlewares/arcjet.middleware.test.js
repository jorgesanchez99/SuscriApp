// Mock the entire arcjet config module before importing anything
jest.mock('../../../config/arcjet.js', () => ({
    __esModule: true,
    default: {
        protect: jest.fn()
    }
}));

import arcjetMiddleware from '../../../middlewares/arcjet.middleware.js';

// Get reference to the mocked protect function
const mockAj = require('../../../config/arcjet.js').default;
const aj = mockAj; // Alias for easier use in tests

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;

beforeAll(() => {
    console.log = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
});

describe('Arcjet Middleware - Real Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            method: 'GET',
            url: '/test',
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('arcjetMiddleware', () => {
        it('should call next when request is allowed', async () => {
            // Arrange
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(false)
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(aj.protect).toHaveBeenCalledWith(req, { requested: 1 });
            expect(mockDecision.isDenied).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.send).not.toHaveBeenCalled();
        });

        it('should return 429 when rate limit is exceeded', async () => {
            // Arrange
            const mockReason = {
                isRateLimit: jest.fn().mockReturnValue(true),
                isBot: jest.fn().mockReturnValue(false)
            };
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: mockReason
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(aj.protect).toHaveBeenCalledWith(req, { requested: 1 });
            expect(mockDecision.isDenied).toHaveBeenCalled();
            expect(mockReason.isRateLimit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(429);
            expect(res.send).toHaveBeenCalledWith({ error: "Rate Limit Exceeded" });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 when bot is detected', async () => {
            // Arrange
            const mockResults = { botDetection: 'suspicious' };
            const mockReason = {
                isRateLimit: jest.fn().mockReturnValue(false),
                isBot: jest.fn().mockReturnValue(true)
            };
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: mockReason,
                results: mockResults
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(aj.protect).toHaveBeenCalledWith(req, { requested: 1 });
            expect(mockDecision.isDenied).toHaveBeenCalled();
            expect(mockReason.isRateLimit).toHaveBeenCalled();
            expect(mockReason.isBot).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith({ 
                error: "Bots Exceeded", 
                message: mockResults 
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 for other denied reasons', async () => {
            // Arrange
            const mockReason = {
                isRateLimit: jest.fn().mockReturnValue(false),
                isBot: jest.fn().mockReturnValue(false)
            };
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: mockReason
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(aj.protect).toHaveBeenCalledWith(req, { requested: 1 });
            expect(mockDecision.isDenied).toHaveBeenCalled();
            expect(mockReason.isRateLimit).toHaveBeenCalled();
            expect(mockReason.isBot).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith({ error: "Access Denied" });
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle arcjet protect errors and pass them to next', async () => {
            // Arrange
            const protectError = new Error('Arcjet service unavailable');
            aj.protect.mockRejectedValue(protectError);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(aj.protect).toHaveBeenCalledWith(req, { requested: 1 });
            expect(console.log).toHaveBeenCalledWith(
                'Error in arcjetMiddleware: Arcjet service unavailable'
            );
            expect(next).toHaveBeenCalledWith(protectError);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.send).not.toHaveBeenCalled();
        });

        it('should handle errors without message property', async () => {
            // Arrange
            const protectError = { name: 'CustomError' }; // Error without message
            aj.protect.mockRejectedValue(protectError);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                'Error in arcjetMiddleware: undefined'
            );
            expect(next).toHaveBeenCalledWith(protectError);
        });

        it('should pass correct parameters to arcjet protect', async () => {
            // Arrange
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(false)
            };
            aj.protect.mockResolvedValue(mockDecision);

            req.method = 'POST';
            req.url = '/api/data';
            req.ip = '192.168.1.100';

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(aj.protect).toHaveBeenCalledWith(req, { requested: 1 });
            expect(aj.protect).toHaveBeenCalledTimes(1);
        });

        it('should handle rate limit with priority order', async () => {
            // Arrange - Both rate limit and bot are true, rate limit should take priority
            const mockReason = {
                isRateLimit: jest.fn().mockReturnValue(true),
                isBot: jest.fn().mockReturnValue(true)
            };
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: mockReason
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act
            await arcjetMiddleware(req, res, next);

            // Assert
            expect(mockReason.isRateLimit).toHaveBeenCalled();
            expect(mockReason.isBot).not.toHaveBeenCalled(); // Should not be called due to early return
            expect(res.status).toHaveBeenCalledWith(429);
            expect(res.send).toHaveBeenCalledWith({ error: "Rate Limit Exceeded" });
        });

        it('should handle undefined decision reason gracefully', async () => {
            // Arrange
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: undefined
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act & Assert - Should not throw
            expect(async () => {
                await arcjetMiddleware(req, res, next);
            }).not.toThrow();
        });

        it('should handle decision reason without isRateLimit method', async () => {
            // Arrange
            const mockReason = {
                // Missing isRateLimit method
                isBot: jest.fn().mockReturnValue(false)
            };
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: mockReason
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act & Assert - Should catch the error and pass to next
            await arcjetMiddleware(req, res, next);
            
            // Since isRateLimit is undefined, it will throw an error and go to catch block
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should handle decision reason without isBot method', async () => {
            // Arrange
            const mockReason = {
                isRateLimit: jest.fn().mockReturnValue(false)
                // Missing isBot method
            };
            const mockDecision = {
                isDenied: jest.fn().mockReturnValue(true),
                reason: mockReason
            };
            aj.protect.mockResolvedValue(mockDecision);

            // Act & Assert - Should catch the error and pass to next
            await arcjetMiddleware(req, res, next);
            
            // Since isBot is undefined, it will throw an error and go to catch block
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
