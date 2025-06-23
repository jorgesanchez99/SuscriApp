import { getAllUsers, getUserById, updateUser, deleteUser } from '../../../controllers/user.controller.js';
import UserService from '../../../services/user.service.js';

// Mock del UserService
jest.mock('../../../services/user.service.js');

describe('UserController - Real Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    // Setup de mocks para cada test
    req = {
      query: {},
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should get all users with default pagination and return 200 with proper response format', async () => {
      // Arrange
      const serviceResponse = {
        users: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          {
            _id: '507f1f77bcf86cd799439012',
            name: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 2,
          hasNextPage: false,
          hasPrevPage: false
        }
      };

      req.query = {}; // No pagination params
      UserService.getAllUsers.mockResolvedValue(serviceResponse);

      // Act
      await getAllUsers(req, res, next);

      // Assert
      expect(UserService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
      expect(UserService.getAllUsers).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: serviceResponse.users,
        pagination: serviceResponse.pagination
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should get all users with custom pagination parameters', async () => {
      // Arrange
      const serviceResponse = {
        users: [{ _id: '507f1f77bcf86cd799439011', name: 'John' }],
        pagination: {
          currentPage: 2,
          totalPages: 5,
          totalUsers: 25,
          hasNextPage: true,
          hasPrevPage: true
        }
      };

      req.query = { page: '2', limit: '5' };
      UserService.getAllUsers.mockResolvedValue(serviceResponse);

      // Act
      await getAllUsers(req, res, next);

      // Assert
      expect(UserService.getAllUsers).toHaveBeenCalledWith({
        page: 2,
        limit: 5
      });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: serviceResponse.users,
        pagination: serviceResponse.pagination
      });
    });

    test('should handle invalid pagination parameters and use defaults', async () => {
      // Arrange
      const serviceResponse = {
        users: [],
        pagination: { currentPage: 1, totalPages: 0, totalUsers: 0 }
      };

      req.query = { page: 'invalid', limit: 'invalid' };
      UserService.getAllUsers.mockResolvedValue(serviceResponse);

      // Act
      await getAllUsers(req, res, next);

      // Assert
      expect(UserService.getAllUsers).toHaveBeenCalledWith({
        page: 1, // Default when parseInt returns NaN
        limit: 10 // Default when parseInt returns NaN
      });
    });

    test('should handle UserService errors and pass them to next middleware', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      serviceError.statusCode = 500;

      UserService.getAllUsers.mockRejectedValue(serviceError);

      // Act
      await getAllUsers(req, res, next);

      // Assert
      expect(UserService.getAllUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    test('should get user by ID successfully and return 200 with proper response format', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const serviceResponse = {
        _id: userId,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      req.params.id = userId;
      UserService.getUserById.mockResolvedValue(serviceResponse);

      // Act
      await getUserById(req, res, next);

      // Assert
      expect(UserService.getUserById).toHaveBeenCalledWith(userId);
      expect(UserService.getUserById).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: serviceResponse
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user not found and pass error to next middleware', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const serviceError = new Error('Usuario no encontrado');
      serviceError.statusCode = 404;

      req.params.id = userId;
      UserService.getUserById.mockRejectedValue(serviceError);

      // Act
      await getUserById(req, res, next);

      // Assert
      expect(UserService.getUserById).toHaveBeenCalledWith(userId);
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should handle invalid user ID and pass error to next middleware', async () => {
      // Arrange
      const invalidUserId = 'invalid-id';
      const serviceError = new Error('ID de usuario no válido');
      serviceError.statusCode = 400;

      req.params.id = invalidUserId;
      UserService.getUserById.mockRejectedValue(serviceError);

      // Act
      await getUserById(req, res, next);

      // Assert
      expect(UserService.getUserById).toHaveBeenCalledWith(invalidUserId);
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('updateUser', () => {
    test('should update user successfully and return 200 with proper response format', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'John Updated',
        lastName: 'Doe Updated',
        email: 'john.updated@example.com'
      };
      const serviceResponse = {
        _id: userId,
        ...updateData
      };

      req.params.id = userId;
      req.body = updateData;
      UserService.updateUser.mockResolvedValue(serviceResponse);

      // Act
      await updateUser(req, res, next);

      // Assert
      expect(UserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(UserService.updateUser).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: serviceResponse
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle partial update data', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const partialUpdateData = { name: 'John Updated Only' };
      const serviceResponse = {
        _id: userId,
        name: 'John Updated Only',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      req.params.id = userId;
      req.body = partialUpdateData;
      UserService.updateUser.mockResolvedValue(serviceResponse);

      // Act
      await updateUser(req, res, next);

      // Assert
      expect(UserService.updateUser).toHaveBeenCalledWith(userId, partialUpdateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: serviceResponse
      });
    });

    test('should handle update validation errors and pass them to next middleware', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const invalidUpdateData = { email: 'invalid-email' };
      const serviceError = new Error('Email ya está en uso');
      serviceError.statusCode = 409;

      req.params.id = userId;
      req.body = invalidUpdateData;
      UserService.updateUser.mockRejectedValue(serviceError);

      // Act
      await updateUser(req, res, next);

      // Assert
      expect(UserService.updateUser).toHaveBeenCalledWith(userId, invalidUpdateData);
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should handle user not found during update and pass error to next middleware', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };
      const serviceError = new Error('Usuario no encontrado');
      serviceError.statusCode = 404;

      req.params.id = userId;
      req.body = updateData;
      UserService.updateUser.mockRejectedValue(serviceError);

      // Act
      await updateUser(req, res, next);

      // Assert
      expect(UserService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('deleteUser', () => {
    test('should delete user successfully and return 200 with proper response format', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      req.params.id = userId;
      UserService.deleteUser.mockResolvedValue(); // Delete typically returns void

      // Act
      await deleteUser(req, res, next);

      // Assert
      expect(UserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(UserService.deleteUser).toHaveBeenCalledTimes(1);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Usuario eliminado exitosamente"
      });
      
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle user not found during deletion and pass error to next middleware', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const serviceError = new Error('Usuario no encontrado');
      serviceError.statusCode = 404;

      req.params.id = userId;
      UserService.deleteUser.mockRejectedValue(serviceError);

      // Act
      await deleteUser(req, res, next);

      // Assert
      expect(UserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(next).toHaveBeenCalledWith(serviceError);
      
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should handle invalid user ID during deletion and pass error to next middleware', async () => {
      // Arrange
      const invalidUserId = 'invalid-id';
      const serviceError = new Error('ID de usuario no válido');
      serviceError.statusCode = 400;

      req.params.id = invalidUserId;
      UserService.deleteUser.mockRejectedValue(serviceError);

      // Act
      await deleteUser(req, res, next);

      // Assert
      expect(UserService.deleteUser).toHaveBeenCalledWith(invalidUserId);
      expect(next).toHaveBeenCalledWith(serviceError);
    });

    test('should handle database errors during deletion and pass them to next middleware', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const serviceError = new Error('Error de base de datos');
      serviceError.statusCode = 500;

      req.params.id = userId;
      UserService.deleteUser.mockRejectedValue(serviceError);

      // Act
      await deleteUser(req, res, next);

      // Assert
      expect(UserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});
