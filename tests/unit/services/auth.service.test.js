import AuthService from '../../../services/auth.service.js';
import UserService from '../../../services/user.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Mocks
jest.mock('../../../services/user.service.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('mongoose', () => ({
  startSession: jest.fn(),
  Schema: class Schema {
    constructor() {}
    pre() { return this; }
    post() { return this; }
    index() { return this; }
  },
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn().mockImplementation(() => ({}))
  }
}));
jest.mock('../../../config/env.js', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRATION: '24h'
}));

describe('AuthService - Real Unit Tests', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mongoose session mock
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    };
    mongoose.startSession.mockResolvedValue(mockSession);
  });

  describe('signUp', () => {
    test('should create user and return token successfully', async () => {
      // Arrange
      const userData = {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };
      const hashedPassword = 'hashed-password';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          password: hashedPassword
        })
      };
      const token = 'jwt-token';

      UserService.existsByEmail.mockResolvedValue(false);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedPassword);
      UserService.createUser.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(token);

      // Act
      const result = await AuthService.signUp(userData);

      // Assert
      expect(UserService.existsByEmail).toHaveBeenCalledWith('juan@test.com', mockSession);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(UserService.createUser).toHaveBeenCalledWith({
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        password: hashedPassword
      }, mockSession);
      expect(jwt.sign).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, 'test-secret', { expiresIn: '24h' });
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual({
        token,
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com'
        }
      });
    });

    test('should throw error when user already exists', async () => {
      // Arrange
      const userData = {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      UserService.existsByEmail.mockResolvedValue(true);

      // Act & Assert
      await expect(AuthService.signUp(userData)).rejects.toMatchObject({
        message: 'El usuario ya existe',
        statusCode: 409
      });

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    test('should throw error for missing required fields', async () => {
      // Arrange
      const userData = {
        name: '',
        lastName: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      // Act & Assert
      await expect(AuthService.signUp(userData)).rejects.toMatchObject({
        message: 'Todos los campos son obligatorios',
        statusCode: 400
      });

      expect(UserService.existsByEmail).not.toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    test('should throw error for invalid email format', async () => {
      // Arrange
      const userData = {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'invalid-email',
        password: 'password123'
      };

      // Act & Assert
      await expect(AuthService.signUp(userData)).rejects.toMatchObject({
        message: 'Formato de email inválido',
        statusCode: 400
      });

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    test('should throw error for short password', async () => {
      // Arrange
      const userData = {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        password: '123'
      };

      // Act & Assert
      await expect(AuthService.signUp(userData)).rejects.toMatchObject({
        message: 'La contraseña debe tener al menos 6 caracteres',
        statusCode: 400
      });

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    test('should authenticate user successfully and return token', async () => {
      // Arrange
      const credentials = {
        email: 'juan@test.com',
        password: 'password123'
      };
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        password: 'hashed-password',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com',
          password: 'hashed-password'
        })
      };
      const token = 'jwt-token';

      UserService.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(token);

      // Act
      const result = await AuthService.signIn(credentials);

      // Assert
      expect(UserService.getUserByEmail).toHaveBeenCalledWith('juan@test.com', '+password');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, 'test-secret', { expiresIn: '24h' });
      expect(result).toEqual({
        token,
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@test.com'
        }
      });
    });

    test('should throw error when user not found', async () => {
      // Arrange
      const credentials = {
        email: 'notfound@test.com',
        password: 'password123'
      };

      UserService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.signIn(credentials)).rejects.toMatchObject({
        message: 'Usuario o contraseña incorrectos',
        statusCode: 401
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('should throw error when password is incorrect', async () => {
      // Arrange
      const credentials = {
        email: 'juan@test.com',
        password: 'wrongpassword'
      };
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        password: 'hashed-password'
      };

      UserService.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.signIn(credentials)).rejects.toMatchObject({
        message: 'Usuario o contraseña incorrectos',
        statusCode: 401
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
    });

    test('should throw error for missing credentials', async () => {
      // Arrange
      const credentials = {
        email: '',
        password: 'password123'
      };

      // Act & Assert
      await expect(AuthService.signIn(credentials)).rejects.toMatchObject({
        message: 'Email y contraseña son obligatorios',
        statusCode: 400
      });

      expect(UserService.getUserByEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    test('should verify token and return user successfully', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const decoded = { _id: '507f1f77bcf86cd799439011' };
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Juan',
        email: 'juan@test.com'
      };

      jwt.verify.mockReturnValue(decoded);
      UserService.getUserById.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.verifyToken(token);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
      expect(UserService.getUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });

    test('should support legacy id field in token', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const decoded = { id: '507f1f77bcf86cd799439011' }; // legacy field
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Juan',
        email: 'juan@test.com'
      };

      jwt.verify.mockReturnValue(decoded);
      UserService.getUserById.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.verifyToken(token);

      // Assert
      expect(UserService.getUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });

    test('should throw error for token without user ID', async () => {
      // Arrange
      const token = 'invalid-token';
      const decoded = {}; // no ID field

      jwt.verify.mockReturnValue(decoded);

      // Act & Assert
      await expect(AuthService.verifyToken(token)).rejects.toMatchObject({
        message: 'Token no contiene ID de usuario válido',
        statusCode: 401
      });

      expect(UserService.getUserById).not.toHaveBeenCalled();
    });

    test('should throw error when user not found', async () => {
      // Arrange
      const token = 'valid-token';
      const decoded = { _id: '507f1f77bcf86cd799439011' };

      jwt.verify.mockReturnValue(decoded);
      UserService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.verifyToken(token)).rejects.toMatchObject({
        message: 'Usuario no encontrado',
        statusCode: 401
      });
    });

    test('should handle expired token error', async () => {
      // Arrange
      const token = 'expired-token';
      const jwtError = new Error('Token expired');
      jwtError.name = 'TokenExpiredError';

      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      await expect(AuthService.verifyToken(token)).rejects.toMatchObject({
        message: 'Token expirado. Por favor, inicia sesión de nuevo.',
        statusCode: 401
      });
    });

    test('should handle invalid token error', async () => {
      // Arrange
      const token = 'malformed-token';
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';

      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      await expect(AuthService.verifyToken(token)).rejects.toMatchObject({
        message: 'Token inválido o manipulado.',
        statusCode: 401
      });
    });
  });

  describe('generateToken', () => {
    test('should generate JWT token with correct payload', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const expectedToken = 'generated-jwt-token';

      jwt.sign.mockReturnValue(expectedToken);

      // Act
      const result = AuthService.generateToken(userId);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith({ _id: userId }, 'test-secret', { expiresIn: '24h' });
      expect(result).toBe(expectedToken);
    });
  });

  describe('hashPassword', () => {
    test('should hash password with salt', async () => {
      // Arrange
      const password = 'password123';
      const salt = 'generated-salt';
      const hashedPassword = 'hashed-password';

      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await AuthService.hashPassword(password);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching passwords', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'hashed-password';

      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await AuthService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    test('should return false for non-matching passwords', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'different-hashed-password';

      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await AuthService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    test('should change password successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword123';
      const mockUser = {
        _id: userId,
        password: 'hashed-old-password'
      };
      const hashedNewPassword = 'hashed-new-password';

      UserService.getUserById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue(hashedNewPassword);
      UserService.updateUser.mockResolvedValue(true);

      // Act
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(UserService.getUserById).toHaveBeenCalledWith(userId, '+password');
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, 'hashed-old-password');
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 'salt');
      expect(UserService.updateUser).toHaveBeenCalledWith(userId, { password: hashedNewPassword });
      expect(result).toBe(true);
    });

    test('should throw error for incorrect current password', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword123';
      const mockUser = {
        _id: userId,
        password: 'hashed-old-password'
      };

      UserService.getUserById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.changePassword(userId, currentPassword, newPassword))
        .rejects.toMatchObject({
          message: 'Contraseña actual incorrecta',
          statusCode: 400
        });

      expect(UserService.updateUser).not.toHaveBeenCalled();
    });

    test('should throw error for short new password', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const currentPassword = 'oldpassword';
      const newPassword = '123'; // too short
      const mockUser = {
        _id: userId,
        password: 'hashed-old-password'
      };

      UserService.getUserById.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(AuthService.changePassword(userId, currentPassword, newPassword))
        .rejects.toMatchObject({
          message: 'La nueva contraseña debe tener al menos 6 caracteres',
          statusCode: 400
        });

      expect(UserService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    test('should return true for successful sign out', async () => {
      // Arrange
      const token = 'some-token';

      // Act
      const result = await AuthService.signOut(token);

      // Assert
      expect(result).toBe(true);
    });
  });
});
