import AuthService from "../services/auth.service.js";

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

    // Verificar el token usando AuthService
    const user = await AuthService.verifyToken(token);

    // Usuario válido → lo añadimos a req.user
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

export default authorized;
