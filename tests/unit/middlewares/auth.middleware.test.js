import authorized from '../../../middlewares/auth.middleware.js';
import AuthService from '../../../services/auth.service.js';

// Mock the AuthService
jest.mock('../../../services/auth.service.js');

describe('Auth Middleware - Real Unit Tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authorized middleware', () => {
        it('should authenticate user with valid Bearer token', async () => {
            // Arrange
            const mockUser = {
                _id: 'user123',
                email: 'test@example.com',
                name: 'Test User'
            };
            
            req.headers.authorization = 'Bearer valid-jwt-token';
            AuthService.verifyToken.mockResolvedValue(mockUser);

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).toHaveBeenCalledWith('valid-jwt-token');
            expect(AuthService.verifyToken).toHaveBeenCalledTimes(1);
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('should return 401 error when no authorization header is provided', async () => {
            // Arrange
            req.headers = {}; // No authorization header

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('should return 401 error when authorization header is empty', async () => {
            // Arrange
            req.headers.authorization = '';

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
        });

        it('should return 401 error when authorization header does not start with Bearer', async () => {
            // Arrange
            req.headers.authorization = 'Basic some-token';

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
        });

        it('should return 401 error when Bearer token is missing', async () => {
            // Arrange
            req.headers.authorization = 'Bearer';

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
        });

        it('should return 401 error when Bearer token is empty string', async () => {
            // Arrange
            req.headers.authorization = 'Bearer ';

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
        });

        it('should handle token verification errors from AuthService', async () => {
            // Arrange
            const verificationError = new Error('Token inválido');
            verificationError.statusCode = 401;
            
            req.headers.authorization = 'Bearer invalid-token';
            AuthService.verifyToken.mockRejectedValue(verificationError);

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).toHaveBeenCalledWith('invalid-token');
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(verificationError);
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('should handle expired token errors from AuthService', async () => {
            // Arrange
            const expiredError = new Error('Token expirado');
            expiredError.statusCode = 401;
            
            req.headers.authorization = 'Bearer expired-token';
            AuthService.verifyToken.mockRejectedValue(expiredError);

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).toHaveBeenCalledWith('expired-token');
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(expiredError);
        });

        it('should handle malformed token errors from AuthService', async () => {
            // Arrange
            const malformedError = new Error('Token malformado');
            malformedError.statusCode = 401;
            
            req.headers.authorization = 'Bearer malformed.token.here';
            AuthService.verifyToken.mockRejectedValue(malformedError);

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).toHaveBeenCalledWith('malformed.token.here');
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(malformedError);
        });

        it('should handle unexpected errors from AuthService', async () => {
            // Arrange
            const unexpectedError = new Error('Database connection failed');
            
            req.headers.authorization = 'Bearer valid-token';
            AuthService.verifyToken.mockRejectedValue(unexpectedError);

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).toHaveBeenCalledWith('valid-token');
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(unexpectedError);
        });

        it('should extract token correctly from complex authorization header', async () => {
            // Arrange
            const mockUser = { _id: 'user123', email: 'test@example.com' };
            const complexToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            
            req.headers.authorization = `Bearer ${complexToken}`;
            AuthService.verifyToken.mockResolvedValue(mockUser);

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).toHaveBeenCalledWith(complexToken);
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });

        it('should return 401 error when authorization header has extra spaces after Bearer', async () => {
            // Arrange - Extra spaces after Bearer will cause split(" ")[1] to be empty string
            req.headers.authorization = 'Bearer   '; // Extra spaces but no token

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
        });

        it('should handle case-sensitive Bearer keyword', async () => {
            // Arrange
            req.headers.authorization = 'bearer valid-token'; // lowercase 'bearer'

            // Act
            await authorized(req, res, next);

            // Assert
            expect(AuthService.verifyToken).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado: token no proporcionado",
                    statusCode: 401
                })
            );
        });
    });
});
