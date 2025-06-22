import {Router} from "express";
import authorized from "../middlewares/auth.middleware.js";
import {
    createSubscription, 
    getAllSubscriptions,
    getSubscriptionById,
    getUserSubscriptions,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
    getUpcomingRenewals,
    getUserSubscriptionStats
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// Rutas públicas (requieren autenticación pero no verificación de propiedad)
subscriptionRouter.get('/', authorized, getAllSubscriptions);
subscriptionRouter.get('/:id', authorized, getSubscriptionById);
subscriptionRouter.post('/', authorized, createSubscription);
subscriptionRouter.put('/:id', authorized, updateSubscription);
subscriptionRouter.delete('/:id', authorized, deleteSubscription);

// Rutas específicas del usuario
subscriptionRouter.get('/users/:id', authorized, getUserSubscriptions);
subscriptionRouter.put('/:id/cancel', authorized, cancelSubscription);
subscriptionRouter.get('/user/upcoming-renewals', authorized, getUpcomingRenewals);
subscriptionRouter.get('/user/stats', authorized, getUserSubscriptionStats);

export default subscriptionRouter;