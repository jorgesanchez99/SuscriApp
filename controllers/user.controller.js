import User from "../models/user.model.js";


export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password -__v");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        // console.error("Error al obtener los usuarios:", error);
        // res.status(500).json({ message: "Error interno del servidor" });
        next(error);
    }
}

export const getUserById = async (req, res,next) => {
    const userId  = req.params.id;

    try {
        const user = await User.findById(userId).select("-password -__v");
        if (!user) {
            const message = "Usuario no encontrado";
            const error = new Error(message);
            error.statusCode = 404; // Not Found
            throw error;
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}