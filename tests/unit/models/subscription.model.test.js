import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Subscription from '../../../models/subscription.model.js';

describe('Subscription Model - Unit Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Subscription.deleteMany({});
  });

  describe('Schema Validation', () => {
    const validSubscriptionData = {
      name: 'Netflix Premium',
      price: 15.99,
      currency: 'USD',
      frequency: 'mensual',
      category: 'streaming',
      paymentMethod: 'tarjeta de crédito',
      status: 'activa',
      startDate: new Date(), // Use current date to avoid expiration
      user: new mongoose.Types.ObjectId()
    };

    test('should create subscription with valid data', async () => {
      // Arrange & Act
      const subscription = new Subscription(validSubscriptionData);
      const savedSubscription = await subscription.save();

      // Assert
      expect(savedSubscription._id).toBeDefined();
      expect(savedSubscription.name).toBe('Netflix Premium');
      expect(savedSubscription.price).toBe(15.99);
      expect(savedSubscription.currency).toBe('USD');
      expect(savedSubscription.frequency).toBe('mensual');
      expect(savedSubscription.category).toBe('streaming');
      expect(savedSubscription.paymentMethod).toBe('tarjeta de crédito');
      expect(savedSubscription.status).toBe('activa');
      expect(savedSubscription.renewalDate).toBeDefined();
      expect(savedSubscription.createdAt).toBeDefined();
      expect(savedSubscription.updatedAt).toBeDefined();
    });

    test('should use default values when not provided', async () => {
      // Arrange
      const minimalData = {
        name: 'Basic Service',
        price: 10,
        category: 'otro',
        startDate: new Date(), // Use current date
        user: new mongoose.Types.ObjectId()
      };

      // Act
      const subscription = new Subscription(minimalData);
      const savedSubscription = await subscription.save();

      // Assert
      expect(savedSubscription.currency).toBe('PEN'); // default
      expect(savedSubscription.frequency).toBe('mensual'); // default
      expect(savedSubscription.paymentMethod).toBe('tarjeta de crédito'); // default
      expect(savedSubscription.status).toBe('activa'); // default
    });

    describe('Name Validation', () => {
      test('should reject subscription without name', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData };
        delete invalidData.name;

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El nombre de la suscripcion es obligatorio');
      });

      test('should reject name shorter than 2 characters', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, name: 'A' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El nombre debe tener al menos 2 caracteres');
      });

      test('should reject name longer than 100 characters', async () => {
        // Arrange
        const longName = 'A'.repeat(101);
        const invalidData = { ...validSubscriptionData, name: longName };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El nombre no debe superar los 100 caracteres');
      });

      test('should reject name with invalid characters', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, name: 'Netflix123!' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El nombre solo puede contener letras sin tildes ni ñ, y espacios');
      });

      test('should accept valid name with letters and spaces', async () => {
        // Arrange
        const validData = { ...validSubscriptionData, name: 'Disney Plus Premium' };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.name).toBe('Disney Plus Premium');
      });

      test('should trim whitespace from name', async () => {
        // Arrange
        const validData = { ...validSubscriptionData, name: '  Netflix  ' };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.name).toBe('Netflix');
      });
    });

    describe('Price Validation', () => {
      test('should reject subscription without price', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData };
        delete invalidData.price;

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El precio de la suscripción es obligatorio');
      });

      test('should reject negative price', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, price: -10 };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El precio no puede ser negativo');
      });

      test('should accept zero price', async () => {
        // Arrange
        const validData = { ...validSubscriptionData, price: 0 };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.price).toBe(0);
      });

      test('should accept decimal price', async () => {
        // Arrange
        const validData = { ...validSubscriptionData, price: 9.99 };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.price).toBe(9.99);
      });
    });

    describe('Currency Validation', () => {
      test('should reject invalid currency', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, currency: 'BTC' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow();
      });

      test('should accept valid currencies', async () => {
        const validCurrencies = ['USD', 'EUR', 'PEN'];

        for (const currency of validCurrencies) {
          // Arrange
          const validData = { ...validSubscriptionData, currency };

          // Act
          const subscription = new Subscription(validData);
          const savedSubscription = await subscription.save();

          // Assert
          expect(savedSubscription.currency).toBe(currency);

          // Cleanup for next iteration
          await Subscription.deleteMany({});
        }
      });
    });

    describe('Frequency Validation', () => {
      test('should reject invalid frequency', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, frequency: 'quincenal' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow();
      });

      test('should accept valid frequencies', async () => {
        const validFrequencies = ['diaria', 'semanal', 'mensual', 'anual'];

        for (const frequency of validFrequencies) {
          // Arrange
          const validData = { ...validSubscriptionData, frequency };

          // Act
          const subscription = new Subscription(validData);
          const savedSubscription = await subscription.save();

          // Assert
          expect(savedSubscription.frequency).toBe(frequency);

          // Cleanup for next iteration
          await Subscription.deleteMany({});
        }
      });
    });

    describe('Category Validation', () => {
      test('should reject subscription without category', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData };
        delete invalidData.category;

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('La categoría de la suscripción es obligatoria');
      });

      test('should reject invalid category', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, category: 'categoria-inexistente' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow();
      });

      test('should accept valid categories', async () => {
        const validCategories = ['streaming', 'software', 'gaming', 'educacion', 'productividad', 'salud', 'finanzas', 'otro'];

        for (const category of validCategories) {
          // Arrange
          const validData = { ...validSubscriptionData, category };

          // Act
          const subscription = new Subscription(validData);
          const savedSubscription = await subscription.save();

          // Assert
          expect(savedSubscription.category).toBe(category);

          // Cleanup for next iteration
          await Subscription.deleteMany({});
        }
      });
    });

    describe('Payment Method Validation', () => {
      test('should reject invalid payment method', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, paymentMethod: 'criptomoneda' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow();
      });

      test('should accept valid payment methods', async () => {
        const validPaymentMethods = [
          'tarjeta de crédito', 'tarjeta de débito', 'PayPal', 
          'transferencia bancaria', 'otros'
        ];

        for (const paymentMethod of validPaymentMethods) {
          // Arrange
          const validData = { ...validSubscriptionData, paymentMethod };

          // Act
          const subscription = new Subscription(validData);
          const savedSubscription = await subscription.save();

          // Assert
          expect(savedSubscription.paymentMethod).toBe(paymentMethod);

          // Cleanup for next iteration
          await Subscription.deleteMany({});
        }
      });

      test('should trim whitespace from payment method', async () => {
        // Arrange
        const validData = { ...validSubscriptionData, paymentMethod: '  PayPal  ' };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.paymentMethod).toBe('PayPal');
      });
    });

    describe('Status Validation', () => {
      test('should reject invalid status', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData, status: 'suspendida' };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow();
      });

      test('should accept valid statuses', async () => {
        const validStatuses = ['activa', 'cancelada', 'pendiente', 'expirada'];

        for (const status of validStatuses) {
          // Arrange - use future dates to avoid automatic expiration
          const futureStartDate = new Date();
          futureStartDate.setDate(futureStartDate.getDate() - 1); // Yesterday
          const futureRenewalDate = new Date();
          futureRenewalDate.setDate(futureRenewalDate.getDate() + 30); // Future
          
          const validData = { 
            ...validSubscriptionData, 
            status,
            startDate: futureStartDate,
            renewalDate: futureRenewalDate
          };

          // Act
          const subscription = new Subscription(validData);
          const savedSubscription = await subscription.save();

          // Assert
          expect(savedSubscription.status).toBe(status);

          // Cleanup for next iteration
          await Subscription.deleteMany({});
        }
      });
    });

    describe('Date Validation', () => {
      test('should reject subscription without start date', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData };
        delete invalidData.startDate;

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('La fecha de inicio es obligatoria');
      });

      test('should reject future start date', async () => {
        // Arrange
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const invalidData = { ...validSubscriptionData, startDate: futureDate };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('La fecha de inicio no puede ser futura');
      });

      test('should accept today as start date', async () => {
        // Arrange
        const today = new Date();
        const validData = { ...validSubscriptionData, startDate: today };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.startDate).toEqual(today);
      });

      test('should reject renewal date before start date', async () => {
        // Arrange
        const startDate = new Date('2025-06-23');
        const renewalDate = new Date('2023-12-31');
        const invalidData = {
          ...validSubscriptionData,
          startDate,
          renewalDate
        };

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('La fecha de renovación debe ser futura');
      });

      test('should accept valid renewal date after start date', async () => {
        // Arrange
        const startDate = new Date('2025-06-23');
        const renewalDate = new Date('2025-07-23');
        const validData = {
          ...validSubscriptionData,
          startDate,
          renewalDate
        };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.renewalDate).toEqual(renewalDate);
      });
    });

    describe('User Validation', () => {
      test('should reject subscription without user', async () => {
        // Arrange
        const invalidData = { ...validSubscriptionData };
        delete invalidData.user;

        // Act & Assert
        const subscription = new Subscription(invalidData);
        await expect(subscription.save()).rejects.toThrow('El usuario es obligatorio');
      });

      test('should accept valid ObjectId for user', async () => {
        // Arrange
        const userId = new mongoose.Types.ObjectId();
        const validData = { ...validSubscriptionData, user: userId };

        // Act
        const subscription = new Subscription(validData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.user).toEqual(userId);
      });
    });
  });

  describe('Pre-save Middleware', () => {
    const baseData = {
      name: 'Test Service',
      price: 10,
      currency: 'USD',
      category: 'otro',
      startDate: new Date('2025-06-23'),
      user: new mongoose.Types.ObjectId()
    };

    describe('Automatic Renewal Date Calculation', () => {
      test('should calculate renewal date for daily frequency', async () => {
        // Arrange
        const subscriptionData = { ...baseData, frequency: 'diaria' };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        const expectedRenewalDate = new Date('2025-06-24'); // +1 day from 2025-06-23
        expect(savedSubscription.renewalDate.toDateString()).toBe(expectedRenewalDate.toDateString());
      });

      test('should calculate renewal date for weekly frequency', async () => {
        // Arrange
        const subscriptionData = { ...baseData, frequency: 'semanal' };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        const expectedRenewalDate = new Date('2025-06-30'); // +7 days from 2025-06-23
        expect(savedSubscription.renewalDate.toDateString()).toBe(expectedRenewalDate.toDateString());
      });

      test('should calculate renewal date for monthly frequency', async () => {
        // Arrange
        const subscriptionData = { ...baseData, frequency: 'mensual' };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        const expectedRenewalDate = new Date('2025-07-23'); // +30 days from 2025-06-23
        expect(savedSubscription.renewalDate.toDateString()).toBe(expectedRenewalDate.toDateString());
      });

      test('should calculate renewal date for annual frequency', async () => {
        // Arrange
        const startDate = new Date('2025-06-23');
        const subscriptionData = { ...baseData, frequency: 'anual', startDate };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        const expectedRenewalDate = new Date('2025-06-23');
        expectedRenewalDate.setDate(expectedRenewalDate.getDate() + 365); // +365 days from start
        expect(savedSubscription.renewalDate.toDateString()).toBe(expectedRenewalDate.toDateString());
      });

      test('should not override manually set renewal date', async () => {
        // Arrange
        const manualRenewalDate = new Date('2025-07-01'); // After start date 2025-06-23
        const subscriptionData = {
          ...baseData,
          frequency: 'mensual',
          renewalDate: manualRenewalDate
        };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.renewalDate.toDateString()).toBe(manualRenewalDate.toDateString());
      });
    });

    describe('Automatic Status Update', () => {
      test('should mark subscription as expired when renewal date has passed', async () => {
        // Arrange
        const pastDate = new Date('2023-06-23'); // Past date
        const pastRenewalDate = new Date('2023-07-23'); // Also past
        const subscriptionData = {
          ...baseData,
          startDate: pastDate,
          renewalDate: pastRenewalDate,
          status: 'activa'
        };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.status).toBe('expirada');
      });

      test('should keep status unchanged when renewal date is in the future', async () => {
        // Arrange
        const futureRenewalDate = new Date();
        futureRenewalDate.setDate(futureRenewalDate.getDate() + 30);
        const subscriptionData = {
          ...baseData,
          renewalDate: futureRenewalDate,
          status: 'activa'
        };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.status).toBe('activa');
      });

      test('should mark as expired even if status was manually set to other value', async () => {
        // Arrange
        const pastDate = new Date('2023-06-23');
        const pastRenewalDate = new Date('2023-07-23');
        const subscriptionData = {
          ...baseData,
          startDate: pastDate,
          renewalDate: pastRenewalDate,
          status: 'pendiente' // Manually set to pending
        };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.status).toBe('expirada'); // Should be overridden
      });
    });

    describe('Combined Middleware Functionality', () => {
      test('should auto-calculate renewal date and mark as expired if calculated date is past', async () => {
        // Arrange - start date very far in the past with monthly frequency
        const veryPastDate = new Date('2020-06-23');
        const subscriptionData = {
          ...baseData,
          startDate: veryPastDate,
          frequency: 'mensual' // Will calculate to 2020-01-31, which is past
        };

        // Act
        const subscription = new Subscription(subscriptionData);
        const savedSubscription = await subscription.save();

        // Assert
        expect(savedSubscription.renewalDate).toBeDefined();
        expect(savedSubscription.status).toBe('expirada');
      });
    });
  });

  describe('Model Methods and Statics', () => {
    test('should create model instance correctly', () => {
      // Arrange
      const subscriptionData = {
        name: 'Test Service',
        price: 10,
        currency: 'USD',
        frequency: 'mensual',
        category: 'otro',
        startDate: new Date('2025-06-23'),
        user: new mongoose.Types.ObjectId()
      };

      // Act
      const subscription = new Subscription(subscriptionData);

      // Assert
      expect(subscription).toBeInstanceOf(mongoose.Document);
      expect(subscription.name).toBe('Test Service');
      expect(subscription.isNew).toBe(true);
    });

    test('should have correct model name', () => {
      // Assert
      expect(Subscription.modelName).toBe('Subscription');
    });

    test('should have timestamps enabled', async () => {
      // Arrange
      const subscriptionData = {
        name: 'Test Service',
        price: 10,
        currency: 'USD',
        category: 'otro',
        startDate: new Date('2025-06-23'),
        user: new mongoose.Types.ObjectId()
      };

      // Act
      const subscription = new Subscription(subscriptionData);
      const savedSubscription = await subscription.save();

      // Assert
      expect(savedSubscription.createdAt).toBeDefined();
      expect(savedSubscription.updatedAt).toBeDefined();
      expect(savedSubscription.createdAt).toBeInstanceOf(Date);
      expect(savedSubscription.updatedAt).toBeInstanceOf(Date);
    });
  });
});
