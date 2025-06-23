import SubscriptionService from '../../../services/subscription.service.js';
import UserService from '../../../services/user.service.js';
import Subscription from '../../../models/subscription.model.js';
import mongoose from 'mongoose';

// Mocks
jest.mock('../../../services/user.service.js');
jest.mock('../../../models/subscription.model.js', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn()
}));
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

describe('SubscriptionService - Real Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mongoose mock
    mongoose.Types = {
      ObjectId: {
        isValid: jest.fn()
      }
    };
  });

  describe('createSubscription', () => {
    test('should create subscription successfully when user exists', async () => {
      // Arrange
      const subscriptionData = {
        name: 'Netflix',
        cost: 9.99,
        frequency: 'monthly',
        category: 'entertainment'
      };
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { _id: userId, name: 'John', email: 'john@example.com' };
      const mockSubscription = { 
        _id: '507f1f77bcf86cd799439012', 
        ...subscriptionData, 
        user: userId 
      };

      UserService.getUserById.mockResolvedValue(mockUser);
      Subscription.create.mockResolvedValue(mockSubscription);

      // Act
      const result = await SubscriptionService.createSubscription(subscriptionData, userId);

      // Assert
      expect(UserService.getUserById).toHaveBeenCalledWith(userId);
      expect(Subscription.create).toHaveBeenCalledWith({
        ...subscriptionData,
        user: userId
      });
      expect(result).toEqual(mockSubscription);
    });

    test('should throw error when user does not exist', async () => {
      // Arrange
      const subscriptionData = {
        name: 'Netflix',
        cost: 9.99,
        frequency: 'monthly'
      };
      const userId = '507f1f77bcf86cd799439011';

      UserService.getUserById.mockRejectedValue(new Error('Usuario no encontrado'));

      // Act & Assert
      await expect(SubscriptionService.createSubscription(subscriptionData, userId))
        .rejects.toThrow('Usuario no encontrado');

      expect(Subscription.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllSubscriptions', () => {    test('should return paginated subscriptions with default options', async () => {
      // Arrange
      const mockSubscriptions = [
        { _id: '1', name: 'Netflix', cost: 9.99 },
        { _id: '2', name: 'Spotify', cost: 4.99 }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockSubscriptions)
      };

      Subscription.find.mockReturnValue(mockQuery);
      Subscription.countDocuments.mockResolvedValue(25);

      // Act
      const result = await SubscriptionService.getAllSubscriptions();

      // Assert
      expect(Subscription.find).toHaveBeenCalledWith({});
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name lastName email');
      expect(mockQuery.select).toHaveBeenCalledWith('-__v');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      
      expect(result).toEqual({
        subscriptions: mockSubscriptions,
        pagination: {
          currentPage: 1,
          totalPages: 3,
          totalSubscriptions: 25,
          hasNextPage: true,
          hasPrevPage: false
        }
      });
    });    test('should apply filters correctly', async () => {
      // Arrange
      const options = {
        status: 'active',
        category: 'entertainment',
        userId: '507f1f77bcf86cd799439011',
        page: 2,
        limit: 5
      };

      const mockSubscriptions = [{ _id: '1', name: 'Netflix' }];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockSubscriptions)
      };

      Subscription.find.mockReturnValue(mockQuery);
      Subscription.countDocuments.mockResolvedValue(8);

      // Act
      const result = await SubscriptionService.getAllSubscriptions(options);

      // Assert
      expect(Subscription.find).toHaveBeenCalledWith({
        status: 'active',
        category: 'entertainment',
        user: '507f1f77bcf86cd799439011'
      });
      expect(mockQuery.skip).toHaveBeenCalledWith(5); // (page-1) * limit = (2-1) * 5
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('getSubscriptionById', () => {    test('should return subscription when valid ID is provided', async () => {
      // Arrange
      const subscriptionId = '507f1f77bcf86cd799439011';
      const mockSubscription = { 
        _id: subscriptionId, 
        name: 'Netflix', 
        cost: 9.99,
        user: { _id: 'user123', name: 'John' }
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockSubscription)
      };
      Subscription.findOne.mockReturnValue(mockQuery);

      // Act
      const result = await SubscriptionService.getSubscriptionById(subscriptionId);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(subscriptionId);
      expect(Subscription.findOne).toHaveBeenCalledWith({ _id: subscriptionId });
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name lastName email');
      expect(mockQuery.select).toHaveBeenCalledWith('-__v');
      expect(result).toEqual(mockSubscription);
    });

    test('should throw error for invalid subscription ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act & Assert
      await expect(SubscriptionService.getSubscriptionById(invalidId))
        .rejects.toMatchObject({
          message: 'ID de suscripción no válido',
          statusCode: 400        });
      
      expect(Subscription.findOne).not.toHaveBeenCalled();
    });    test('should throw error when subscription not found', async () => {
      // Arrange
      const subscriptionId = '507f1f77bcf86cd799439011';

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null)
      };
      Subscription.findOne.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(SubscriptionService.getSubscriptionById(subscriptionId))
        .rejects.toMatchObject({
          message: 'Suscripción no encontrada',
          statusCode: 404
        });
    });
  });

  describe('updateSubscription', () => {
    test('should update subscription successfully', async () => {
      // Arrange
      const subscriptionId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';
      const updateData = {
        name: 'Updated Netflix',
        cost: 11.99
      };

      const mockUpdatedSubscription = { 
        _id: subscriptionId, 
        ...updateData, 
        user: userId 
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockUpdatedSubscription)
      };
      Subscription.findByIdAndUpdate.mockReturnValue(mockQuery);

      // Act
      const result = await SubscriptionService.updateSubscription(subscriptionId, updateData, userId);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(subscriptionId);
      expect(Subscription.findByIdAndUpdate).toHaveBeenCalledWith(
        subscriptionId,
        updateData,
        { new: true, runValidators: true }
      );
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name lastName email');
      expect(result).toEqual(mockUpdatedSubscription);
    });

    test('should throw error for invalid subscription ID', async () => {
      // Arrange
      const invalidId = 'invalid-id';
      const updateData = { name: 'Test' };
      const userId = '507f1f77bcf86cd799439012';
      
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      // Act & Assert
      await expect(SubscriptionService.updateSubscription(invalidId, updateData, userId))
        .rejects.toMatchObject({
          message: 'ID de suscripción no válido',
          statusCode: 400
        });
      
      expect(Subscription.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deleteSubscription', () => {
    test('should delete subscription successfully', async () => {
      // Arrange
      const subscriptionId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';
      const mockDeletedSubscription = { 
        _id: subscriptionId, 
        name: 'Netflix', 
        user: userId 
      };

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Subscription.findByIdAndDelete.mockResolvedValue(mockDeletedSubscription);

      // Act
      const result = await SubscriptionService.deleteSubscription(subscriptionId, userId);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(subscriptionId);
      expect(Subscription.findByIdAndDelete).toHaveBeenCalledWith(subscriptionId);
      expect(result).toEqual(mockDeletedSubscription);
    });

    test('should throw error when subscription not found', async () => {
      // Arrange
      const subscriptionId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Subscription.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(SubscriptionService.deleteSubscription(subscriptionId, userId))
        .rejects.toMatchObject({
          message: 'Suscripción no encontrada',
          statusCode: 404
        });
    });
  });

  describe('getUserSubscriptionStats', () => {
    test('should return user subscription statistics', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockStats = [
        {
          totalActive: 5,
          totalInactive: 2,
          totalCancelled: 1,
          monthlyTotal: 45.99,
          yearlyTotal: 551.88,
          averageCost: 9.20,
          categoryCosts: [
            { _id: 'entertainment', total: 25.99, count: 3 },
            { _id: 'productivity', total: 20.00, count: 2 }
          ]
        }
      ];

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      UserService.getUserById.mockResolvedValue({ _id: userId });
      Subscription.aggregate.mockResolvedValue(mockStats);

      // Act
      const result = await SubscriptionService.getUserSubscriptionStats(userId);

      // Assert
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(userId);
      expect(UserService.getUserById).toHaveBeenCalledWith(userId);
      expect(Subscription.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual(mockStats[0]);
    });

    test('should return default stats when no subscriptions exist', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      UserService.getUserById.mockResolvedValue({ _id: userId });
      Subscription.aggregate.mockResolvedValue([]);

      // Act
      const result = await SubscriptionService.getUserSubscriptionStats(userId);

      // Assert
      expect(result).toEqual({
        totalActive: 0,
        totalInactive: 0,
        totalCancelled: 0,
        monthlyTotal: 0,
        yearlyTotal: 0,
        averageCost: 0,
        categoryCosts: []
      });
    });
  });
});
