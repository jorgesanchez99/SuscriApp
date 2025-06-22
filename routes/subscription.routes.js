import {Router} from "express";
import authorized from "../middlewares/auth.middleware.js";
import {createSubscription, getUserSubscriptions} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => res.send({title: "Get All Subscriptions"}));
subscriptionRouter.get('/:id', (req, res) => res.send({title: "Get Subscription Details"}));
subscriptionRouter.post('/',authorized ,createSubscription);
subscriptionRouter.put('/:id', (req, res) => res.send({title: "Update Subscription"}));
subscriptionRouter.delete('/:id', (req, res) => res.send({title: "Delete Subscription"}));

subscriptionRouter.get('/users/:id',authorized, getUserSubscriptions);
subscriptionRouter.put('/:id/cancel', (req, res) => res.send({title: "Cancel Subscription"}));
subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({title: "Get Upcoming Renewals"}));


export default subscriptionRouter;