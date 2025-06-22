import {Router} from "express";
import authorized from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
    createSubscriptionValidators,
    updateSubscriptionValidators,
    subscriptionIdValidator,
    userIdValidator,
    queryValidators,
    searchValidators
} from "../validators/subscription.validators.js";
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
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// Rutas públicas (requieren autenticación pero no verificación de propiedad)
subscriptionRouter.get('/', authorized, validate(queryValidators), getAllSubscriptions);
subscriptionRouter.get('/:id', authorized, validate(subscriptionIdValidator), getSubscriptionById);
subscriptionRouter.post('/', authorized, validate(createSubscriptionValidators), createSubscription);
subscriptionRouter.put('/:id', authorized, validate(updateSubscriptionValidators), updateSubscription);
subscriptionRouter.delete('/:id', authorized, validate(subscriptionIdValidator), deleteSubscription);

// Rutas específicas del usuario
subscriptionRouter.get('/users/:id', authorized, validate(userIdValidator.concat(queryValidators)), getUserSubscriptions);
subscriptionRouter.put('/:id/cancel', authorized, validate(subscriptionIdValidator), cancelSubscription);
subscriptionRouter.get('/user/upcoming-renewals', authorized, validate(queryValidators), getUpcomingRenewals);
subscriptionRouter.get('/user/stats', authorized, getUserSubscriptionStats);
subscriptionRouter.get('/user/search', authorized, validate(searchValidators), searchSubscriptions);

export default subscriptionRouter;