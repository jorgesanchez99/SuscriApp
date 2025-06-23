import UserService from '../../../services/user.service.js';
import mongoose from 'mongoose';

// Mocks
jest.mock('../../../models/user.model.js', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn()
}));
jest.mock('mongoose');

// Import the mocked User after mocking
import User from '../../../models/user.model.js';

describe('UserService - Real Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset User mock methods
    User.find.mockClear();
    User.findById.mockClear();
    User.findOne.mockClear();
    User.findByIdAndUpdate.mockClear();
    User.findByIdAndDelete.mockClear();
    User.create.mockClear();
    User.countDocuments.mockClear();
    
    // Setup mongoose mock
    mongoose.Types = {
      ObjectId: {
        isValid: jest.fn()
      }
    };
  });

  describe('getAllUsers', () => {
    test('should return paginated users with default options', async () => {
      // Arrange
      const mockUsers = [
        { _id: '507f1f77bcf86cd799439011', name: 'John', email: 'john@example.com' },
        { _id: '507f1f77bcf86cd799439012', name: 'Jane', email: 'jane@example.com' }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers)
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(25);

      // Act
      const result = await UserService.getAllUsers();

      // Assert
      expect(User.find).toHaveBeenCalledWith();
      expect(mockQuery.select).toHaveBeenCalledWith('-password -__v');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      
      expect(result).toEqual({
        users: mockUsers,
        pagination: {
          currentPage: 1,
          totalPages: 3,
          totalUsers: 25,
          hasNextPage: true,
          hasPrevPage: false
        }
      });
    });

    test('should handle custom pagination options', async () => {
      // Arrange
      const mockUsers = [{ name: 'Test User' }];
      const options = { page: 2, limit: 5, select: 'name email' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers)
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(15);

      // Act
      const result = await UserService.getAllUsers(options);

      // Assert
      expect(mockQuery.select).toHaveBeenCalledWith('name email');
      expect(mockQuery.skip).toHaveBeenCalledWith(5); // (page-1) * limit = (2-1) * 5
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPrevPage).toBe(true);
    });

    test('should throw error when database operation fails', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      User.find.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(UserService.getAllUsers()).rejects.toThrow('Error al obtener usuarios: Database error');
    });
  });

  describe('getUserById', () => {
    test('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { _id: userId, name: 'John', email: 'john@example.com' };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findById.mockReturnValue(mockQuery);

      // Act
      const result = await UserService.getUserById(userId);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password -__v');
      expect(result).toEqual(mockUser);
    });

    test('should use custom select fields', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { _id: userId, name: 'John', email: 'john@example.com' };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findById.mockReturnValue(mockQuery);

      // Act
      const result = await UserService.getUserById(userId, 'name email');

      // Assert
      expect(mockQuery.select).toHaveBeenCalledWith('name email');
      expect(result).toEqual(mockUser);
    });

    test('should throw error for invalid user ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act & Assert
      await expect(UserService.getUserById(invalidId)).rejects.toMatchObject({
        message: 'ID de usuario no válido',
        statusCode: 400
      });
      
      expect(User.findById).not.toHaveBeenCalled();
    });

    test('should throw error when user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      User.findById.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(UserService.getUserById(userId)).rejects.toMatchObject({
        message: 'Usuario no encontrado',
        statusCode: 404
      });
    });
  });

  describe('getUserByEmail', () => {
    test('should return user when email exists', async () => {
      // Arrange
      const email = 'john@example.com';
      const mockUser = { _id: '507f1f77bcf86cd799439011', email, name: 'John' };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findOne.mockReturnValue(mockQuery);

      // Act
      const result = await UserService.getUserByEmail(email);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(mockQuery.select).toHaveBeenCalledWith('-password -__v');
      expect(result).toEqual(mockUser);
    });

    test('should return null when email not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      User.findOne.mockReturnValue(mockQuery);

      // Act
      const result = await UserService.getUserByEmail(email);

      // Assert
      expect(result).toBeNull();
    });

    test('should throw error when database operation fails', async () => {
      // Arrange
      const email = 'test@example.com';

      const mockQuery = {
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      User.findOne.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(UserService.getUserByEmail(email)).rejects.toThrow('Error al buscar usuario por email: Database error');
    });
  });

  describe('createUser', () => {
    test('should create user successfully without session', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };

      const mockCreatedUser = { _id: '507f1f77bcf86cd799439011', ...userData };

      User.create.mockResolvedValue([mockCreatedUser]);

      // Act
      const result = await UserService.createUser(userData);      // Assert
      expect(User.create).toHaveBeenCalledWith([userData], {});
      expect(result).toEqual(mockCreatedUser);
    });

    test('should create user successfully with session', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };

      const mockSession = { id: 'session123' };
      const mockCreatedUser = { _id: '507f1f77bcf86cd799439011', ...userData };

      User.create.mockResolvedValue([mockCreatedUser]);

      // Act
      const result = await UserService.createUser(userData, mockSession);

      // Assert
      expect(User.create).toHaveBeenCalledWith([userData], { session: mockSession });
      expect(result).toEqual(mockCreatedUser);
    });

    test('should throw error for duplicate email', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'hashedPassword123'
      };

      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;
      User.create.mockRejectedValue(duplicateError);      // Act & Assert
      await expect(UserService.createUser(userData)).rejects.toMatchObject({
        message: 'El email ya está registrado',
        statusCode: 409
      });
    });

    test('should throw original error for non-duplicate errors', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };

      const originalError = new Error('Validation error');
      User.create.mockRejectedValue(originalError);

      // Act & Assert
      await expect(UserService.createUser(userData)).rejects.toThrow('Validation error');
    });
  });
});
