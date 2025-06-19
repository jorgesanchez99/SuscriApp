import {Router} from "express";

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => res.send({title: "Get All Subscriptions"}));
subscriptionRouter.get('/:id', (req, res) => res.send({title: "Get Subscription Details"}));
subscriptionRouter.post('/', (req, res) => res.send({title: "Create New Subscription"}));
subscriptionRouter.put('/:id', (req, res) => res.send({title: "Update Subscription"}));
subscriptionRouter.delete('/:id', (req, res) => res.send({title: "Delete Subscription"}));

subscriptionRouter.get('/users/:id', (req, res) => res.send({title: "Get User Subscriptions"}));
subscriptionRouter.put('/:id/cancel', (req, res) => res.send({title: "Cancel Subscription"}));
subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({title: "Get Upcoming Renewals"}));


export default subscriptionRouter;