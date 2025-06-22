import SubscriptionService from "../services/subscription.service.js";

export const createSubscription = async (req, res, next) => {
    try {
        const subscriptionData = req.body;
        const userId = req.user._id;

        const subscription = await SubscriptionService.createSubscription(subscriptionData, userId);

        res.status(201).json({
            success: true,
            message: "Suscripción creada exitosamente",
            data: subscription
        });
    } catch (error) {
        next(error);
    }
}

export const getAllSubscriptions = async (req, res, next) => {
    try {
        const { page, limit, status, category, frequency } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            status,
            category,
            frequency
        };

        const result = await SubscriptionService.getAllSubscriptions(options);

        res.status(200).json({
            success: true,
            data: result.subscriptions,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

export const getSubscriptionById = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const subscription = await SubscriptionService.getSubscriptionById(subscriptionId);

        res.status(200).json({
            success: true,
            data: subscription
        });
    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        // Verificar que el usuario sea el propietario de las suscripciones
        if (req.user.id !== userId) {
            const error = new Error("No autorizado para acceder a estas suscripciones");
            error.statusCode = 403;
            throw error;
        }

        const { status, category, frequency } = req.query;
        const options = { status, category, frequency };

        const subscriptions = await SubscriptionService.getUserSubscriptions(userId, options);

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        next(error);
    }
}

export const updateSubscription = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const updateData = req.body;
        const userId = req.user._id;

        const updatedSubscription = await SubscriptionService.updateSubscription(
            subscriptionId, 
            updateData, 
            userId
        );

        res.status(200).json({
            success: true,
            message: "Suscripción actualizada exitosamente",
            data: updatedSubscription
        });
    } catch (error) {
        next(error);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const userId = req.user._id;

        const cancelledSubscription = await SubscriptionService.cancelSubscription(
            subscriptionId, 
            userId
        );

        res.status(200).json({
            success: true,
            message: "Suscripción cancelada exitosamente",
            data: cancelledSubscription
        });
    } catch (error) {
        next(error);
    }
}

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscriptionId = req.params.id;
        const userId = req.user._id;

        await SubscriptionService.deleteSubscription(subscriptionId, userId);

        res.status(200).json({
            success: true,
            message: "Suscripción eliminada exitosamente"
        });
    } catch (error) {
        next(error);
    }
}

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const { days } = req.query;
        const userId = req.user._id;

        const renewals = await SubscriptionService.getUpcomingRenewals(
            parseInt(days) || 7, 
            userId
        );

        res.status(200).json({
            success: true,
            data: renewals
        });
    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptionStats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const stats = await SubscriptionService.getUserSubscriptionStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
}

export const searchSubscriptions = async (req, res, next) => {
    try {
        const { q: searchTerm, page, limit } = req.query;
        const userId = req.user._id;
        
        if (!searchTerm || searchTerm.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "El término de búsqueda debe tener al menos 2 caracteres",
                    statusCode: 400
                }
            });
        }

        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        };

        const subscriptions = await SubscriptionService.searchSubscriptions(
            searchTerm.trim(), 
            userId, 
            options
        );

        res.status(200).json({
            success: true,
            data: subscriptions,
            searchTerm: searchTerm.trim()
        });
    } catch (error) {
        next(error);
    }
}
