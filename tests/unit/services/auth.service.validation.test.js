import AuthService from '../../../services/auth.service.js';
import UserService from '../../../services/user.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Mock de los módulos externos (pero NO del config para usar las variables reales)
jest.mock('../../../services/user.service.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('mongoose');

describe('AuthService - Real Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSignUpData', () => {
    test('should not throw error for valid signup data', () => {
      const validData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      expect(() => {
        AuthService.validateSignUpData(validData);
      }).not.toThrow();
    });

    test('should throw error for missing name', () => {
      const invalidData = {
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      expect(() => {
        AuthService.validateSignUpData(invalidData);
      }).toThrow('Todos los campos son obligatorios');
    });

    test('should throw error for missing email', () => {
      const invalidData = {
        name: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      expect(() => {
        AuthService.validateSignUpData(invalidData);
      }).toThrow('Todos los campos son obligatorios');
    });

    test('should throw error for short password', () => {
      const invalidData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123'
      };

      expect(() => {
        AuthService.validateSignUpData(invalidData);
      }).toThrow('La contraseña debe tener al menos 6 caracteres');
    });

    test('should throw error for invalid email format', () => {
      const invalidData = {
        name: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      expect(() => {
        AuthService.validateSignUpData(invalidData);
      }).toThrow('Formato de email inválido');
    });
  });
  describe('hashPassword', () => {
    test('should hash password with bcrypt', async () => {
      const password = 'password123';
      const salt = 'generated_salt';
      const hashedPassword = 'hashed_password';

      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await AuthService.hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    test('should compare passwords correctly', async () => {
      const password = 'password123';
      const hashedPassword = 'hashed_password';

      bcrypt.compare.mockResolvedValue(true);

      const result = await AuthService.comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('generateToken', () => {
    test('should generate JWT token', () => {
      const userId = 'user123';
      const token = 'jwt_token';

      jwt.sign.mockReturnValue(token);

      const result = AuthService.generateToken(userId);      expect(jwt.sign).toHaveBeenCalledWith(
        { _id: userId },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(result).toBe(token);
    });
  });
  describe('verifyToken', () => {
    test('should verify JWT token successfully', async () => {
      const token = 'jwt_token';
      const decoded = { _id: 'user123' };
      const mockUser = { _id: 'user123', name: 'John', email: 'john@example.com' };

      jwt.verify.mockReturnValue(decoded);
      UserService.getUserById.mockResolvedValue(mockUser);

      const result = await AuthService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(UserService.getUserById).toHaveBeenCalledWith('user123');
      expect(result).toBe(mockUser);
    });

    test('should throw error for invalid token', async () => {
      const token = 'invalid_token';

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });      await expect(AuthService.verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn()
      };
      mongoose.startSession.mockResolvedValue(mockSession);
    });

    test('should register new user successfully', async () => {
      const userData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };      const hashedPassword = 'hashed_password';
      const salt = 'generated_salt';
      const mockUser = {
        _id: 'user123',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        toObject: () => ({
          _id: 'user123',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: hashedPassword
        })
      };
      const token = 'jwt_token';

      // Mock dependencies
      UserService.existsByEmail.mockResolvedValue(false);
      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      UserService.createUser.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(token);

      const result = await AuthService.signUp(userData);

      expect(UserService.existsByEmail).toHaveBeenCalledWith(userData.email, expect.any(Object));
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, salt);
      expect(UserService.createUser).toHaveBeenCalledWith({
        name: userData.name,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword
      }, expect.any(Object));      expect(result).toEqual({
        user: {
          _id: 'user123',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        token
      });
    });

    test('should throw error if user already exists', async () => {
      const userData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      UserService.existsByEmail.mockResolvedValue(true);

      await expect(AuthService.signUp(userData)).rejects.toMatchObject({
        message: 'El usuario ya existe',
        statusCode: 409
      });
    });
  });
});
