const errorMiddleware = (err, req, res, next) => {

    try {
        let error = {...err} // Crear una copia del error original
        console.error(error); // Log the error for debugging

        // Moongoose bad ObjectId error: Esto ocurre cuando se intenta buscar un recurso con un ID que no es válido
        if(err.name === 'CastError') {
            const message = `Resource not found`;
            error = new Error(message);
            error.statusCode = 404; // Not Found
        }

        // Moongoose duplicate key error: Esto ocurre cuando se intenta crear un recurso con un campo único que ya existe
        if(err.code === 11000) {
            const message = `Duplicate field value entered`;
            error = new Error(message);
            error.statusCode = 400; // Bad Request
        }

        // Moongoose validation error: Esto ocurre cuando los datos enviados no cumplen con las validaciones del modelo
        if(err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error = new Error(message);
            error.statusCode = 400; // Bad Request
        }

        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }

}

export default errorMiddleware;