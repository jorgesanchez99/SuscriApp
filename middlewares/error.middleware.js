const errorMiddleware = (err, req, res, next) => {

    try {
        let statusCode = err.statusCode || 500; // Default to 500 if no status code is set
        let message = err.message || 'Internal Server Error'; // Default message

        console.error({statusCode,message}); // Log the error for debugging

        // Moongoose bad ObjectId error: ID no válido
        if(err.name === 'CastError') {
            message = `Recurso no válido: el ID es incorrecto o no existe.`;
            statusCode = 404; // Not Found
        }

        // Moongoose duplicate key error
        if(err.code === 11000) {
            message = `Duplicate field value entered`;
            statusCode = 409; // Conflict
        }

        // Moongoose validation error: errores de validación
        if(err.name === 'ValidationError') {
            message = Object.values(err.errors).map(val => val.message).join(', ');
            statusCode = 400; // Bad Request
        }

        res.status(statusCode).json({ success: false, message });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }

}

export default errorMiddleware;