/**
 * Middleware de logging estructurado para la aplicación
 * Proporciona información detallada sobre las peticiones HTTP
 */

import morgan from 'morgan';

/**
 * Configuración de logging para desarrollo
 * Muestra información detallada de cada petición
 */
export const developmentLogger = morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const responseTime = tokens['response-time'](req, res);
    
    // Formatear fecha/hora
    const timestamp = new Date().toISOString();
    
    // Formatear método y URL
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    
    // Información del usuario si está autenticado
    const userInfo = req.user ? ` [Usuario: ${req.user._id}]` : '';
    
    // Color basado en status code
    let statusColor = '';
    if (status >= 500) statusColor = '\x1b[31m'; // Rojo
    else if (status >= 400) statusColor = '\x1b[33m'; // Amarillo
    else if (status >= 300) statusColor = '\x1b[36m'; // Cian
    else if (status >= 200) statusColor = '\x1b[32m'; // Verde
    
    return [
        `🌐 ${timestamp}`,
        `${statusColor}${method}\x1b[0m`,
        `${url}`,
        `${statusColor}${status}\x1b[0m`,
        `${responseTime}ms${userInfo}`,
        tokens['user-agent'](req, res) ? `- ${tokens['user-agent'](req, res)}` : ''
    ].join(' ');
});

/**
 * Configuración de logging para producción
 * Formato más compacto y estructurado
 */
export const productionLogger = morgan('combined', {
    // Solo logear errores 4xx y 5xx en producción
    skip: (req, res) => res.statusCode < 400
});

/**
 * Configuración de logging para testing
 * Minimal logging para no interferir con los tests
 */
export const testLogger = morgan('tiny', {
    // No logear en modo testing
    skip: () => process.env.NODE_ENV === 'test'
});

/**
 * Middleware personalizado para logear errores
 */
export const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const userInfo = req.user ? ` [Usuario: ${req.user._id}]` : '';
    
    console.error(`❌ ${timestamp} ERROR ${method} ${url}${userInfo}`);
    console.error(`   Mensaje: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    console.error(`   User-Agent: ${userAgent}`);
    
    // Si hay información adicional del error
    if (err.statusCode) {
        console.error(`   Status Code: ${err.statusCode}`);
    }
    
    next(err);
};

/**
 * Seleccionar el logger apropiado basado en el entorno
 */
export const getLogger = () => {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
        case 'production':
            return productionLogger;
        case 'test':
            return testLogger;
        case 'development':
        default:
            return developmentLogger;
    }
};

/**
 * Middleware para logear información de inicio de sesión
 */
export const authLogger = (req, res, next) => {
    // Solo logear en rutas de autenticación
    if (req.path.includes('/auth/')) {
        const timestamp = new Date().toISOString();
        const method = req.method;
        const path = req.path;
        const ip = req.ip || req.connection.remoteAddress;
        
        console.log(`🔐 ${timestamp} AUTH ${method} ${path} from ${ip}`);
    }
    next();
};

export default getLogger;
