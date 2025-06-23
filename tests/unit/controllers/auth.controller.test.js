import { signUp, signIn, signOut } from '../../../controllers/auth.controller.js';
import AuthService from '../../../services/auth.service.js';

// Mock del AuthService
jest.mock('../../../services/auth.service.js');

describe('AuthController - Real Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    // Setup de mocks para cada test
    req = {
      body: {},
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    test('should create user successfully and return 201 with proper response format', async () => {
      // Arrange
      const userData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const serviceResponse = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        token: 'jwt-token-here'
      };

      req.body = userData;
      AuthService.signUp.mockResolvedValue(serviceResponse);

      // Act
      await signUp(req, res, next);

      // Assert
      expect(AuthService.signUp).toHaveBeenCalledWith(userData);
      expect(AuthService.signUp).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario creado exitosamente",
        data: serviceResponse
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle AuthService errors and pass them to next middleware', async () => {
      // Arrange
      const userData = {
        name: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const serviceError = new Error('Email ya está registrado');
      serviceError.statusCode = 409;

      req.body = userData;
      AuthService.signUp.mockRejectedValue(serviceError);

      // Act
      await signUp(req, res, next);

      // Assert
      expect(AuthService.signUp).toHaveBeenCalledWith(userData);
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should handle unexpected errors and pass them to next middleware', async () => {
      // Arrange
      const userData = { name: 'John' };
      const unexpectedError = new Error('Database connection failed');

      req.body = userData;
      AuthService.signUp.mockRejectedValue(unexpectedError);

      // Act
      await signUp(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(unexpectedError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    test('should authenticate user successfully and return 200 with proper response format', async () => {
      // Arrange
      const credentials = {
        email: 'john@example.com',
        password: 'password123'
      };
      
      const serviceResponse = {
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        token: 'jwt-token-here'
      };

      req.body = credentials;
      AuthService.signIn.mockResolvedValue(serviceResponse);

      // Act
      await signIn(req, res, next);

      // Assert
      expect(AuthService.signIn).toHaveBeenCalledWith(credentials);
      expect(AuthService.signIn).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Inicio de sesión exitoso",
        data: serviceResponse
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle invalid credentials and pass error to next middleware', async () => {
      // Arrange
      const credentials = {
        email: 'john@example.com',
        password: 'wrong-password'
      };
      
      const serviceError = new Error('Credenciales inválidas');
      serviceError.statusCode = 401;

      req.body = credentials;
      AuthService.signIn.mockRejectedValue(serviceError);

      // Act
      await signIn(req, res, next);

      // Assert
      expect(AuthService.signIn).toHaveBeenCalledWith(credentials);
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should handle user not found and pass error to next middleware', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const serviceError = new Error('Usuario no encontrado');
      serviceError.statusCode = 404;

      req.body = credentials;
      AuthService.signIn.mockRejectedValue(serviceError);

      // Act
      await signIn(req, res, next);

      // Assert
      expect(AuthService.signIn).toHaveBeenCalledWith(credentials);
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('signOut', () => {
    test('should sign out user successfully and return 200 with proper response format', async () => {
      // Arrange
      const token = 'Bearer jwt-token-here';
      req.headers.authorization = token;
      
      AuthService.signOut.mockResolvedValue();

      // Act
      await signOut(req, res, next);

      // Assert
      expect(AuthService.signOut).toHaveBeenCalledWith('jwt-token-here');
      expect(AuthService.signOut).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sesión cerrada exitosamente"
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle missing authorization header gracefully', async () => {
      // Arrange
      req.headers = {}; // No authorization header
      
      AuthService.signOut.mockResolvedValue();

      // Act
      await signOut(req, res, next);

      // Assert
      expect(AuthService.signOut).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sesión cerrada exitosamente"
      });
    });

    test('should handle malformed authorization header', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat';
      
      AuthService.signOut.mockResolvedValue();

      // Act
      await signOut(req, res, next);

      // Assert
      expect(AuthService.signOut).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sesión cerrada exitosamente"
      });
    });

    test('should handle AuthService errors and pass them to next middleware', async () => {
      // Arrange
      const token = 'Bearer jwt-token-here';
      req.headers.authorization = token;
      
      const serviceError = new Error('Token inválido');
      serviceError.statusCode = 401;
      
      AuthService.signOut.mockRejectedValue(serviceError);

      // Act
      await signOut(req, res, next);

      // Assert
      expect(AuthService.signOut).toHaveBeenCalledWith('jwt-token-here');
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
