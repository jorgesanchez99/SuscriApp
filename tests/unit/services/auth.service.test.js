import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthService from '../../services/auth.service.js';
import UserService from '../../services/user.service.js';

// Mock de dependencias
jest.mock('../../services/user.service.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('mongoose', () => ({
  startSession: jest.fn(() => ({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn()
  }))
}));

describe('AuthService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      const result = await AuthService.hashPassword(password);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    test('should throw error when hashing fails', async () => {
      const password = 'testPassword123';
      const error = new Error('Hashing failed');
      
      bcrypt.hash.mockRejectedValue(error);
      
      await expect(AuthService.hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('Password Comparison', () => {
    test('should validate correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      bcrypt.compare.mockResolvedValue(true);
      
      const isValid = await AuthService.comparePassword(password, hashedPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2b$10$hashedPasswordExample';
      
      bcrypt.compare.mockResolvedValue(false);
      
      const isValid = await AuthService.comparePassword(password, hashedPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const token = 'mockJwtToken';
      
      jwt.sign.mockReturnValue(token);
      
      const result = AuthService.generateToken(payload);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: expect.any(String) }
      );
      expect(result).toBe(token);
    });

    test('should verify JWT token correctly', () => {
      const token = 'mockJwtToken';
      const decodedPayload = { id: 'user123', email: 'test@example.com' };
      
      jwt.verify.mockReturnValue(decodedPayload);
      
      const result = AuthService.verifyToken(token);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toEqual(decodedPayload);
    });

    test('should throw error for invalid token', () => {
      const token = 'invalidToken';
      const error = new Error('Invalid token');
      
      jwt.verify.mockImplementation(() => {
        throw error;
      });
      
      expect(() => AuthService.verifyToken(token)).toThrow('Invalid token');
    });
  });

  describe('Data Validation', () => {
    test('should validate complete signup data', () => {
      const validData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      expect(() => AuthService.validateSignUpData(validData)).not.toThrow();
    });

    test('should throw error for missing required fields', () => {
      const incompleteData = {
        name: 'John',
        // lastName missing
        email: 'john@example.com',
        password: 'password123'
      };
      
      expect(() => AuthService.validateSignUpData(incompleteData)).toThrow();
    });

    test('should throw error for empty string fields', () => {
      const emptyData = {
        name: '',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      expect(() => AuthService.validateSignUpData(emptyData)).toThrow();
    });
  });

  describe('User Registration', () => {
    test('should register new user successfully', async () => {
      const userData = {
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const hashedPassword = '$2b$10$hashedPassword';
      const mockUser = {
        _id: 'user123',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const mockToken = 'mockJwtToken';
      
      // Mock dependencies
      UserService.existsByEmail.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      UserService.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(mockToken);
      
      const result = await AuthService.signUp(userData);
      
      expect(UserService.existsByEmail).toHaveBeenCalledWith(userData.email, expect.any(Object));
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(UserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword
        }),
        expect.any(Object)
      );
      
      expect(result).toEqual({
        user: mockUser,
        token: mockToken
      });
    });

    test('should throw error when user already exists', async () => {
      const userData = {
        name: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      UserService.existsByEmail.mockResolvedValue(true);
      
      await expect(AuthService.signUp(userData)).rejects.toThrow('El usuario ya existe');
      expect(UserService.create).not.toHaveBeenCalled();
    });
  });

  describe('User Login', () => {
    test('should login user with valid credentials', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'user123',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '$2b$10$hashedPassword'
      };
      const mockToken = 'mockJwtToken';
      
      UserService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);
      
      const result = await AuthService.signIn(credentials);
      
      expect(UserService.findByEmail).toHaveBeenCalledWith(credentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      
      expect(result).toEqual({
        user: expect.objectContaining({
          _id: mockUser._id,
          name: mockUser.name,
          lastName: mockUser.lastName,
          email: mockUser.email
        }),
        token: mockToken
      });
      expect(result.user.password).toBeUndefined();
    });

    test('should throw error for invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      UserService.findByEmail.mockResolvedValue(null);
      
      await expect(AuthService.signIn(credentials)).rejects.toThrow('Credenciales inválidas');
    });

    test('should throw error for invalid password', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'wrongPassword'
      };
      
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        password: '$2b$10$hashedPassword'
      };
      
      UserService.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(AuthService.signIn(credentials)).rejects.toThrow('Credenciales inválidas');
    });
  });
});
