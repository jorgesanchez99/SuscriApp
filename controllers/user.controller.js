import UserService from "../services/user.service.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        };

        const result = await UserService.getAllUsers(options);
        
        res.status(200).json({ 
            success: true, 
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await UserService.getUserById(userId);

        res.status(200).json({ 
            success: true, 
            data: user 
        });
    } catch (error) {
        next(error);
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        
        const updatedUser = await UserService.updateUser(userId, updateData);

        res.status(200).json({
            success: true,
            message: "Usuario actualizado exitosamente",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await UserService.deleteUser(userId);

        res.status(200).json({
            success: true,
            message: "Usuario eliminado exitosamente"
        });
    } catch (error) {
        next(error);
    }
}