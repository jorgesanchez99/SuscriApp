import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const authorized = async (req, res, next) => {
  try {
    let token;

    // Extraer el token del header Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const error = new Error("No autorizado: token no proporcionado");
      error.statusCode = 401;
      return next(error);
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar al usuario correspondiente
    const user = await User.findById(decoded.id).select("-password -__v");

    if (!user) {
      const error = new Error("No autorizado: usuario no encontrado");
      error.statusCode = 401;
      return next(error);
    }

    // Usuario válido → lo añadimos a req.user
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Token expirado. Por favor, inicia sesión de nuevo.";
    }

    if (error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "Token inválido o manipulado.";
    }

    return next(error);
  }
};

export default authorized;
