import {Router} from "express";
import {getAllUsers, getUserById} from "../controllers/user.controller.js";
import authorized from "../middlewares/auth.middleware.js";


const userRouter = Router();


userRouter.get('/', getAllUsers);
userRouter.get('/:id', authorized , getUserById);
userRouter.post('/', (req, res) => res.send({title: "Create New User"}));
userRouter.put('/:id', (req, res) => res.send({title: "Update User"}));
userRouter.delete('/:id', (req, res) => res.send({title: "Delete User"}));

export default userRouter;