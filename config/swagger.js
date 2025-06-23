/**
 * Configuración de Swagger/OpenAPI para documentación de la API
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SuscripcionTracker API',
            version: '1.0.0',
            description: `
## 📋 Descripción
API para gestión de suscripciones personales. Permite a los usuarios registrar, rastrear y gestionar sus suscripciones a diferentes servicios.

## 🔑 Autenticación
La mayoría de los endpoints requieren autenticación mediante JWT. Incluye el token en el header:
\`\`\`
Authorization: Bearer <tu_jwt_token>
\`\`\`

## 📊 Características
- ✅ CRUD completo de suscripciones
- ✅ Gestión de usuarios
- ✅ Filtrado y paginación
- ✅ Búsqueda de suscripciones
- ✅ Estadísticas y métricas
- ✅ Alertas de renovación

## 🚀 Respuestas de la API
Todas las respuestas siguen el formato estándar:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje descriptivo"
}
\`\`\`

## ❌ Manejo de Errores
Los errores se retornan con el formato:
\`\`\`json
{
  "success": false,
  "error": {
    "message": "Descripción del error",
    "statusCode": 400,
    "details": [ ... ]
  }
}
\`\`\`
            `,
            contact: {
                name: 'SuscripcionTracker API Support',
                email: 'support@suscripciontracker.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Servidor de desarrollo'
            },
            {
                url: 'https://api.suscripciontracker.com',
                description: 'Servidor de producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingresa tu JWT token'
                }
            },
            schemas: {
                // Esquema de Usuario
                User: {
                    type: 'object',
                    required: ['name', 'lastName', 'email', 'password'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID único del usuario',
                            example: '507f1f77bcf86cd799439011'
                        },
                        name: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'Nombre del usuario',
                            example: 'Juan'
                        },
                        lastName: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                            description: 'Apellido del usuario',
                            example: 'Pérez'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email único del usuario',
                            example: 'juan.perez@gmail.com'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación',
                            example: '2025-01-15T10:30:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de última actualización',
                            example: '2025-01-15T10:30:00.000Z'
                        }
                    }
                },
                
                // Esquema de Suscripción
                Subscription: {
                    type: 'object',
                    required: ['name', 'price', 'currency', 'frequency', 'startDate', 'renewalDate'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID único de la suscripción',
                            example: '507f1f77bcf86cd799439012'
                        },
                        name: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 100,
                            description: 'Nombre del servicio',
                            example: 'Netflix Premium'
                        },
                        description: {
                            type: 'string',
                            maxLength: 500,
                            description: 'Descripción opcional del servicio',
                            example: 'Plan familiar con 4K y múltiples pantallas'
                        },
                        price: {
                            type: 'number',
                            minimum: 0.01,
                            description: 'Precio de la suscripción',
                            example: 15.99
                        },
                        currency: {
                            type: 'string',
                            enum: ['USD', 'EUR', 'MXN', 'ARS', 'COP', 'PEN', 'CLP'],
                            description: 'Moneda del precio',
                            example: 'USD'
                        },
                        frequency: {
                            type: 'string',
                            enum: ['mensual', 'trimestral', 'semestral', 'anual'],
                            description: 'Frecuencia de cobro',
                            example: 'mensual'
                        },
                        category: {
                            type: 'string',
                            enum: ['streaming', 'software', 'gaming', 'educacion', 'productividad', 'salud', 'finanzas', 'otro'],
                            description: 'Categoría del servicio',
                            example: 'streaming'
                        },
                        status: {
                            type: 'string',
                            enum: ['activa', 'cancelada', 'pausada', 'expirada'],
                            description: 'Estado actual de la suscripción',
                            example: 'activa'
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Fecha de inicio de la suscripción',
                            example: '2025-06-23'
                        },
                        renewalDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Próxima fecha de renovación',
                            example: '2025-07-23'
                        },
                        website: {
                            type: 'string',
                            format: 'uri',
                            description: 'Sitio web del servicio',
                            example: 'https://netflix.com'
                        },
                        notes: {
                            type: 'string',
                            maxLength: 1000,
                            description: 'Notas adicionales',
                            example: 'Cuenta compartida con familia'
                        },
                        user: {
                            type: 'string',
                            description: 'ID del usuario propietario',
                            example: '507f1f77bcf86cd799439011'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación',
                            example: '2025-01-15T10:30:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de última actualización',
                            example: '2025-01-15T10:30:00.000Z'
                        }
                    }
                },

                // Esquemas de respuesta
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object',
                            description: 'Datos de respuesta'
                        },
                        message: {
                            type: 'string',
                            description: 'Mensaje descriptivo',
                            example: 'Operación realizada exitosamente'
                        }
                    }
                },

                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        error: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    description: 'Descripción del error',
                                    example: 'Error en la validación de datos'
                                },
                                statusCode: {
                                    type: 'integer',
                                    description: 'Código de estado HTTP',
                                    example: 400
                                },
                                details: {
                                    type: 'array',
                                    description: 'Detalles específicos del error',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            field: {
                                                type: 'string',
                                                example: 'email'
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Email no válido'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },

                PaginationResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Subscription'
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                currentPage: {
                                    type: 'integer',
                                    example: 1
                                },
                                totalPages: {
                                    type: 'integer',
                                    example: 5
                                },
                                totalSubscriptions: {
                                    type: 'integer',
                                    example: 47
                                },
                                hasNextPage: {
                                    type: 'boolean',
                                    example: true
                                },
                                hasPrevPage: {
                                    type: 'boolean',
                                    example: false
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './routes/*.js',
        './controllers/*.js',
        './models/*.js'
    ]
};

const specs = swaggerJsdoc(options);

export default specs;
