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

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gestión de suscripciones
 */

/**
 * @swagger
 * /api/v1/subscriptions:
 *   get:
 *     summary: Obtener todas las suscripciones
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [activa, cancelada, pausada, expirada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [streaming, software, gaming, educacion, productividad, salud, finanzas, otro]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: frequency
 *         schema:
 *           type: string
 *           enum: [mensual, trimestral, semestral, anual]
 *         description: Filtrar por frecuencia
 *     responses:
 *       200:
 *         description: Lista de suscripciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   get:
 *     summary: Obtener suscripción por ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Suscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/subscriptions:
 *   post:
 *     summary: Crear nueva suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - currency
 *               - frequency
 *               - startDate
 *               - renewalDate
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Netflix Premium"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Plan familiar con 4K"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 15.99
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, MXN, ARS, COP, PEN, CLP]
 *                 example: "USD"
 *               frequency:
 *                 type: string
 *                 enum: [mensual, trimestral, semestral, anual]
 *                 example: "mensual"
 *               category:
 *                 type: string
 *                 enum: [streaming, software, gaming, educacion, productividad, salud, finanzas, otro]
 *                 example: "streaming"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               renewalDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-01"
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://netflix.com"
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Cuenta compartida con familia"
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   put:
 *     summary: Actualizar suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               status:
 *                 type: string
 *                 enum: [activa, cancelada, pausada, expirada]
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Suscripción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Suscripción no encontrada
 *       403:
 *         description: No autorizado para modificar esta suscripción
 */

/**
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   delete:
 *     summary: Eliminar suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Suscripción no encontrada
 *       403:
 *         description: No autorizado para eliminar esta suscripción
 */

/**
 * @swagger
 * /api/v1/subscriptions/users/{id}:
 *   get:
 *     summary: Obtener suscripciones de un usuario
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [activa, cancelada, pausada, expirada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [streaming, software, gaming, educacion, productividad, salud, finanzas, otro]
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Suscripciones del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Subscription'
 *       403:
 *         description: No autorizado para acceder a estas suscripciones
 */

/**
 * @swagger
 * /api/v1/subscriptions/{id}/cancel:
 *   put:
 *     summary: Cancelar suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Suscripción no encontrada
 *       403:
 *         description: No autorizado para cancelar esta suscripción
 */

/**
 * @swagger
 * /api/v1/subscriptions/user/upcoming-renewals:
 *   get:
 *     summary: Obtener renovaciones próximas del usuario
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Días hacia adelante para buscar renovaciones
 *     responses:
 *       200:
 *         description: Renovaciones próximas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Subscription'
 */

/**
 * @swagger
 * /api/v1/subscriptions/user/stats:
 *   get:
 *     summary: Obtener estadísticas de suscripciones del usuario
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalSubscriptions:
 *                           type: integer
 *                           example: 12
 *                         activeSubscriptions:
 *                           type: integer
 *                           example: 8
 *                         cancelledSubscriptions:
 *                           type: integer
 *                           example: 4
 *                         estimatedMonthlyExpense:
 *                           type: number
 *                           example: 89.97
 */

/**
 * @swagger
 * /api/v1/subscriptions/user/search:
 *   get:
 *     summary: Buscar suscripciones del usuario
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Término de búsqueda
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Búsqueda realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Subscription'
 *                     searchTerm:
 *                       type: string
 *                       example: "netflix"
 *       400:
 *         description: Término de búsqueda inválido
 */

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