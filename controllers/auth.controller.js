import AuthService from "../services/auth.service.js";

export const signUp = async (req, res, next) => {
    try {
        const userData = req.body;
        const result = await AuthService.signUp(userData);
        
        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const credentials = req.body;
        const result = await AuthService.signIn(credentials);

        res.status(200).json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: result
        });
    } catch(error) {
        next(error);
    }
}

export const signOut = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        await AuthService.signOut(token);

        res.status(200).json({
            success: true,
            message: "Sesión cerrada exitosamente"
        });
    } catch (error) {
        next(error);
    }
}