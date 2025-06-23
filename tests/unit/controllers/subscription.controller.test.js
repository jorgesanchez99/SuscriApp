import {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    getUserSubscriptions,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
    getUpcomingRenewals,
    getUserSubscriptionStats,
    searchSubscriptions
} from '../../../controllers/subscription.controller.js';
import SubscriptionService from '../../../services/subscription.service.js';

// Mock the subscription service
jest.mock('../../../services/subscription.service.js');

describe('Subscription Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: { _id: 'user123', id: 'user123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createSubscription', () => {
        it('should create a subscription successfully', async () => {
            const subscriptionData = { name: 'Netflix', price: 15.99 };
            const mockSubscription = { _id: 'sub123', ...subscriptionData };
            
            req.body = subscriptionData;
            SubscriptionService.createSubscription.mockResolvedValue(mockSubscription);

            await createSubscription(req, res, next);

            expect(SubscriptionService.createSubscription).toHaveBeenCalledWith(
                subscriptionData,
                'user123'
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Suscripción creada exitosamente",
                data: mockSubscription
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            req.body = { name: 'Netflix' };
            SubscriptionService.createSubscription.mockRejectedValue(error);

            await createSubscription(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getAllSubscriptions', () => {
        it('should get all subscriptions with default pagination', async () => {
            const mockResult = {
                subscriptions: [{ _id: 'sub1' }, { _id: 'sub2' }],
                pagination: { page: 1, limit: 10, total: 2 }
            };
            
            SubscriptionService.getAllSubscriptions.mockResolvedValue(mockResult);

            await getAllSubscriptions(req, res, next);

            expect(SubscriptionService.getAllSubscriptions).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                status: undefined,
                category: undefined,
                frequency: undefined
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.subscriptions,
                pagination: mockResult.pagination
            });
        });

        it('should get all subscriptions with custom pagination and filters', async () => {
            req.query = {
                page: '2',
                limit: '5',
                status: 'active',
                category: 'entertainment',
                frequency: 'monthly'
            };

            const mockResult = {
                subscriptions: [{ _id: 'sub1' }],
                pagination: { page: 2, limit: 5, total: 1 }
            };
            
            SubscriptionService.getAllSubscriptions.mockResolvedValue(mockResult);

            await getAllSubscriptions(req, res, next);

            expect(SubscriptionService.getAllSubscriptions).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                status: 'active',
                category: 'entertainment',
                frequency: 'monthly'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.subscriptions,
                pagination: mockResult.pagination
            });
        });

        it('should handle invalid pagination values', async () => {
            req.query = { page: 'invalid', limit: 'invalid' };

            const mockResult = {
                subscriptions: [],
                pagination: { page: 1, limit: 10, total: 0 }
            };
            
            SubscriptionService.getAllSubscriptions.mockResolvedValue(mockResult);

            await getAllSubscriptions(req, res, next);

            expect(SubscriptionService.getAllSubscriptions).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                status: undefined,
                category: undefined,
                frequency: undefined
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            SubscriptionService.getAllSubscriptions.mockRejectedValue(error);

            await getAllSubscriptions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getSubscriptionById', () => {
        it('should get subscription by id successfully', async () => {
            const mockSubscription = { _id: 'sub123', name: 'Netflix' };
            req.params.id = 'sub123';
            
            SubscriptionService.getSubscriptionById.mockResolvedValue(mockSubscription);

            await getSubscriptionById(req, res, next);

            expect(SubscriptionService.getSubscriptionById).toHaveBeenCalledWith('sub123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSubscription
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Subscription not found');
            req.params.id = 'nonexistent';
            SubscriptionService.getSubscriptionById.mockRejectedValue(error);

            await getSubscriptionById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserSubscriptions', () => {
        it('should get user subscriptions successfully', async () => {
            const mockSubscriptions = [{ _id: 'sub1' }, { _id: 'sub2' }];
            req.params.id = 'user123';
            req.query = { status: 'active', category: 'entertainment' };
            
            SubscriptionService.getUserSubscriptions.mockResolvedValue(mockSubscriptions);

            await getUserSubscriptions(req, res, next);

            expect(SubscriptionService.getUserSubscriptions).toHaveBeenCalledWith(
                'user123',
                { status: 'active', category: 'entertainment', frequency: undefined }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSubscriptions
            });
        });

        it('should deny access when user tries to access other user subscriptions', async () => {
            req.params.id = 'otherUser';
            req.user.id = 'user123';

            await getUserSubscriptions(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "No autorizado para acceder a estas suscripciones",
                    statusCode: 403
                })
            );
            expect(SubscriptionService.getUserSubscriptions).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            req.params.id = 'user123';
            SubscriptionService.getUserSubscriptions.mockRejectedValue(error);

            await getUserSubscriptions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateSubscription', () => {
        it('should update subscription successfully', async () => {
            const updateData = { name: 'Netflix Premium', price: 19.99 };
            const mockUpdatedSubscription = { _id: 'sub123', ...updateData };
            
            req.params.id = 'sub123';
            req.body = updateData;
            
            SubscriptionService.updateSubscription.mockResolvedValue(mockUpdatedSubscription);

            await updateSubscription(req, res, next);

            expect(SubscriptionService.updateSubscription).toHaveBeenCalledWith(
                'sub123',
                updateData,
                'user123'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Suscripción actualizada exitosamente",
                data: mockUpdatedSubscription
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Update failed');
            req.params.id = 'sub123';
            req.body = { name: 'Updated name' };
            SubscriptionService.updateSubscription.mockRejectedValue(error);

            await updateSubscription(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel subscription successfully', async () => {
            const mockCancelledSubscription = { _id: 'sub123', status: 'cancelled' };
            req.params.id = 'sub123';
            
            SubscriptionService.cancelSubscription.mockResolvedValue(mockCancelledSubscription);

            await cancelSubscription(req, res, next);

            expect(SubscriptionService.cancelSubscription).toHaveBeenCalledWith(
                'sub123',
                'user123'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Suscripción cancelada exitosamente",
                data: mockCancelledSubscription
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Cancel failed');
            req.params.id = 'sub123';
            SubscriptionService.cancelSubscription.mockRejectedValue(error);

            await cancelSubscription(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteSubscription', () => {
        it('should delete subscription successfully', async () => {
            req.params.id = 'sub123';
            
            SubscriptionService.deleteSubscription.mockResolvedValue();

            await deleteSubscription(req, res, next);

            expect(SubscriptionService.deleteSubscription).toHaveBeenCalledWith(
                'sub123',
                'user123'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Suscripción eliminada exitosamente"
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Delete failed');
            req.params.id = 'sub123';
            SubscriptionService.deleteSubscription.mockRejectedValue(error);

            await deleteSubscription(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUpcomingRenewals', () => {
        it('should get upcoming renewals with default days', async () => {
            const mockRenewals = [{ _id: 'sub1', nextRenewal: new Date() }];
            
            SubscriptionService.getUpcomingRenewals.mockResolvedValue(mockRenewals);

            await getUpcomingRenewals(req, res, next);

            expect(SubscriptionService.getUpcomingRenewals).toHaveBeenCalledWith(
                7,
                'user123'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockRenewals
            });
        });

        it('should get upcoming renewals with custom days', async () => {
            const mockRenewals = [{ _id: 'sub1', nextRenewal: new Date() }];
            req.query.days = '14';
            
            SubscriptionService.getUpcomingRenewals.mockResolvedValue(mockRenewals);

            await getUpcomingRenewals(req, res, next);

            expect(SubscriptionService.getUpcomingRenewals).toHaveBeenCalledWith(
                14,
                'user123'
            );
        });

        it('should handle invalid days parameter', async () => {
            const mockRenewals = [];
            req.query.days = 'invalid';
            
            SubscriptionService.getUpcomingRenewals.mockResolvedValue(mockRenewals);

            await getUpcomingRenewals(req, res, next);

            expect(SubscriptionService.getUpcomingRenewals).toHaveBeenCalledWith(
                7,
                'user123'
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            SubscriptionService.getUpcomingRenewals.mockRejectedValue(error);

            await getUpcomingRenewals(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserSubscriptionStats', () => {
        it('should get user subscription stats successfully', async () => {
            const mockStats = {
                totalSubscriptions: 5,
                totalCost: 99.95,
                activeSubscriptions: 4,
                cancelledSubscriptions: 1
            };
            
            SubscriptionService.getUserSubscriptionStats.mockResolvedValue(mockStats);

            await getUserSubscriptionStats(req, res, next);

            expect(SubscriptionService.getUserSubscriptionStats).toHaveBeenCalledWith('user123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Stats error');
            SubscriptionService.getUserSubscriptionStats.mockRejectedValue(error);

            await getUserSubscriptionStats(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('searchSubscriptions', () => {
        it('should search subscriptions successfully', async () => {
            const mockSubscriptions = [{ _id: 'sub1', name: 'Netflix' }];
            req.query = { q: 'Netflix', page: '1', limit: '10' };
            
            SubscriptionService.searchSubscriptions.mockResolvedValue(mockSubscriptions);

            await searchSubscriptions(req, res, next);

            expect(SubscriptionService.searchSubscriptions).toHaveBeenCalledWith(
                'Netflix',
                'user123',
                { page: 1, limit: 10 }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSubscriptions,
                searchTerm: 'Netflix'
            });
        });

        it('should search subscriptions with whitespace trimming', async () => {
            const mockSubscriptions = [{ _id: 'sub1', name: 'Netflix' }];
            req.query = { q: '  Netflix  ' };
            
            SubscriptionService.searchSubscriptions.mockResolvedValue(mockSubscriptions);

            await searchSubscriptions(req, res, next);

            expect(SubscriptionService.searchSubscriptions).toHaveBeenCalledWith(
                'Netflix',
                'user123',
                { page: 1, limit: 10 }
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSubscriptions,
                searchTerm: 'Netflix'
            });
        });

        it('should return error for empty search term', async () => {
            req.query = { q: '' };

            await searchSubscriptions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "El término de búsqueda debe tener al menos 2 caracteres",
                    statusCode: 400
                }
            });
            expect(SubscriptionService.searchSubscriptions).not.toHaveBeenCalled();
        });

        it('should return error for search term less than 2 characters', async () => {
            req.query = { q: 'a' };

            await searchSubscriptions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "El término de búsqueda debe tener al menos 2 caracteres",
                    statusCode: 400
                }
            });
            expect(SubscriptionService.searchSubscriptions).not.toHaveBeenCalled();
        });

        it('should return error for whitespace-only search term', async () => {
            req.query = { q: '   ' };

            await searchSubscriptions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "El término de búsqueda debe tener al menos 2 caracteres",
                    statusCode: 400
                }
            });
            expect(SubscriptionService.searchSubscriptions).not.toHaveBeenCalled();
        });

        it('should return error for missing search term', async () => {
            req.query = {};

            await searchSubscriptions(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: "El término de búsqueda debe tener al menos 2 caracteres",
                    statusCode: 400
                }
            });
            expect(SubscriptionService.searchSubscriptions).not.toHaveBeenCalled();
        });

        it('should handle invalid pagination in search', async () => {
            const mockSubscriptions = [];
            req.query = { q: 'Netflix', page: 'invalid', limit: 'invalid' };
            
            SubscriptionService.searchSubscriptions.mockResolvedValue(mockSubscriptions);

            await searchSubscriptions(req, res, next);

            expect(SubscriptionService.searchSubscriptions).toHaveBeenCalledWith(
                'Netflix',
                'user123',
                { page: 1, limit: 10 }
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Search failed');
            req.query = { q: 'Netflix' };
            SubscriptionService.searchSubscriptions.mockRejectedValue(error);

            await searchSubscriptions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
