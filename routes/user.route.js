import {Router} from "express";
import {getAllUsers, getUserById, updateUser, deleteUser} from "../controllers/user.controller.js";
import authorized from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', authorized, getUserById);
userRouter.put('/:id', authorized, updateUser);
userRouter.delete('/:id', authorized, deleteUser);

export default userRouter;