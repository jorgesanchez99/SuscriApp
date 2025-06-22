import Subscription from "../models/subscription.model.js";


export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id // Asignar}); el ID del usuario autenticado
        });

        res.status(201).json({
            success: true,
            message: "Suscripción creada exitosamente",
            data: subscription
        });

    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    console.log(req.user.id);
    try {
        //revisar que el usuario sea el propietario de las suscripciones
        if (req.user.id !== req.params.id) {
            const error = new Error("No autorizado para acceder a estas suscripciones");
            error.statusCode = 403; // Forbidden
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.user._id }).select("-__v")

        res.status(200).json({
            success: true,
            data: subscriptions
        });

    } catch (error) {
        next(error);
    }
}
