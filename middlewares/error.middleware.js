const errorMiddleware = (err, req, res, next) => {
  console.error("🔴 Error capturado:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  // ❌ Error por ID inválido (ObjectId mal formado en MongoDB)
  if (err.name === "CastError") {
    message = "ID de recurso no válido o inexistente.";
    statusCode = 400;
  }

  // 🚫 Error por clave única duplicada (como email, username, etc.)
  if (err.code === 11000) {
    // ❗ Seguridad: NO revelamos el campo duplicado
    message = "Ya existe un registro con los datos ingresados.";
    statusCode = 409;
  }

  // ⚠️ Error de validación (campos requeridos, formato incorrecto, etc.)
  if (err.name === "ValidationError") {
    const errores = Object.values(err.errors).map(val => val.message);
    message = errores.join(", ");
    statusCode = 400;
  }

  // 🔐 Otras excepciones comunes que podrías manejar después:
  // if (err.name === "JsonWebTokenError") { ... }
  // if (err.name === "TokenExpiredError") { ... }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode
    }
  });
};

export default errorMiddleware;
