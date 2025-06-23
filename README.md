# Suscripción Tracker API

Una API REST completa para el seguimiento y gestión de suscripciones personales con funcionalidades avanzadas de seguridad, validación y documentación.

## 🚀 Características Principales

- ✅ **Autenticación JWT** completa (registro, login, logout)
- ✅ **Gestión de usuarios** con perfiles y validaciones
- ✅ **CRUD completo de suscripciones** con filtrado y búsqueda
- ✅ **Seguridad avanzada** con Arcjet (rate limiting, bot detection)
- ✅ **Validación robusta** de datos en todos los endpoints
- ✅ **Manejo centralizado de errores** con responses estructurados
- ✅ **Documentación Swagger/OpenAPI** interactiva
- ✅ **Testing automatizado** con Jest y cobertura
- ✅ **Paginación y filtrado** en endpoints de listado
- ✅ **Estadísticas y métricas** de suscripciones
- ✅ **Scripts de utilidades** para testing y desarrollo
- ✅ **Arquitectura escalable** con patrón MVC

## 📋 Requisitos previos

- Node.js >= 16.0.0
- MongoDB (local o remoto)
- NPM o Yarn

## ⚙️ Configuración del entorno

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd SuscripcionTracker
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

#### Opción A: Copiar desde el template
```bash
# Para desarrollo
cp .env.example .env.development.local

# Para producción
cp .env.example .env.production.local
```

#### Opción B: Usar el ejemplo de desarrollo
```bash
cp .env.development.local.example .env.development.local
```

### 4. Configurar las variables requeridas

Edita el archivo `.env.development.local` y configura:

```env
# Base de datos
DB_URI=mongodb://localhost:27017/suscripciontracker_dev

# JWT Secret (genera uno nuevo)
JWT_SECRET=tu-clave-secreta-super-segura-de-al-menos-32-caracteres

# Arcjet (obtén tu clave en https://app.arcjet.com)
ARCJET_KEY=tu-clave-arcjet-aqui
```

#### Generar JWT_SECRET seguro
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Configurar MongoDB

#### Opción A: MongoDB local
```bash
# Instalar MongoDB Community Edition
# Luego iniciar el servicio
mongod
```

#### Opción B: MongoDB Atlas (Cloud)
1. Crear cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crear cluster
3. Obtener connection string
4. Configurar `DB_URI` en el archivo `.env`

## 🏃‍♂️ Inicio rápido

### Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en http://localhost:4000

### Documentación API (Swagger)
```bash
npm run dev
```
Luego visita: http://localhost:4000/api-docs

### Producción
```bash
npm start
```

## 📚 Documentación de la API

### 🎨 Swagger UI Interactivo
La API incluye documentación completa con Swagger UI que permite:
- 📖 **Explorar todos los endpoints** disponibles
- 🧪 **Probar la API directamente** desde el navegador
- 📋 **Ver esquemas de datos** detallados
- 🔐 **Autenticación integrada** para endpoints protegidos

**URL de acceso**: http://localhost:4000/api-docs

### 📋 Endpoints Principales

#### 🔐 Autenticación
- `POST /api/v1/auth/sign-up` - Registro de usuario
- `POST /api/v1/auth/sign-in` - Inicio de sesión
- `POST /api/v1/auth/sign-out` - Cerrar sesión

#### 👥 Usuarios
- `GET /api/v1/users` - Obtener todos los usuarios (admin)
- `GET /api/v1/users/:id` - Obtener usuario por ID
- `PUT /api/v1/users/:id` - Actualizar perfil de usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario

#### 📊 Suscripciones
- `POST /api/v1/subscriptions` - Crear nueva suscripción
- `GET /api/v1/subscriptions` - Listar suscripciones con filtros y paginación
- `GET /api/v1/subscriptions/:id` - Obtener suscripción específica
- `PUT /api/v1/subscriptions/:id` - Actualizar suscripción
- `DELETE /api/v1/subscriptions/:id` - Eliminar suscripción
- `GET /api/v1/subscriptions/users/:userId` - Suscripciones de un usuario
- `GET /api/v1/subscriptions/search` - Búsqueda de suscripciones
- `GET /api/v1/subscriptions/stats` - Estadísticas y métricas

#### 🔍 Filtros y Búsqueda Disponibles
- **Por estado**: `active`, `inactive`, `expired`
- **Por categoría**: `streaming`, `software`, `gaming`, etc.
- **Por precio**: rango mínimo y máximo
- **Por fecha**: rango de fechas
- **Búsqueda por texto**: nombre de suscripción
- **Paginación**: `page` y `limit`
- **Ordenamiento**: `sortBy` y `sortOrder`

## 🔧 Scripts disponibles

```bash
# Ejecución
npm start              # Ejecutar en producción
npm run dev            # Ejecutar en desarrollo con nodemon

# Código y calidad
npm run lint           # Verificar código con ESLint

# Testing
npm test               # Ejecutar todas las pruebas
npm run test:watch     # Ejecutar pruebas en modo watch
npm run test:coverage  # Ejecutar pruebas con reporte de cobertura
npm run test:unit      # Ejecutar solo pruebas unitarias
npm run test:integration # Ejecutar pruebas de integración
npm run test:e2e       # Ejecutar pruebas end-to-end

# Utilidades de desarrollo
npm run test:db        # Probar conexión a base de datos
npm run test:user      # Crear usuario de prueba
npm run test:token     # Obtener token para testing
npm run generate:jwt   # Generar JWT secret seguro
```

## 🧪 Testing

El proyecto incluye un sistema completo de testing:

### 🏗️ Estructura de Tests
```
tests/
├── setup.js                    # Configuración global
├── unit/                       # Pruebas unitarias
│   ├── basic.test.js          # Tests básicos
│   ├── services/              # Tests de servicios
│   │   └── auth.service.test.js
│   └── validators/            # Tests de validadores
│       └── subscription.validators.test.js
├── integration/               # Tests de integración (pendiente)
└── e2e/                      # Tests end-to-end (pendiente)
```

### 🛠️ Scripts de Testing
- **Base de datos en memoria**: MongoDB Memory Server para tests aislados
- **Mocks y fixtures**: Datos de prueba con Faker.js
- **Cobertura de código**: Reportes detallados con Jest
- **Testing de API**: Preparado para tests de endpoints

## 🛡️ Seguridad y Validación

### 🔐 Características de Seguridad
- **Autenticación JWT**: Tokens seguros con expiración configurable
- **Rate Limiting**: Protección contra spam y ataques DoS con Arcjet
- **Bot Detection**: Detección y bloqueo automático de bots maliciosos
- **Validación de datos**: Validación exhaustiva con express-validator
- **Hash de contraseñas**: Encriptación segura con bcryptjs
- **CORS configurado**: Protección contra ataques cross-origin
- **Headers de seguridad**: Configuración de headers HTTP seguros

### ✅ Validaciones Implementadas
- **Email único**: Prevención de registros duplicados
- **Contraseñas seguras**: Requisitos mínimos de complejidad
- **Formatos de datos**: Validación de tipos y formatos
- **Rangos de valores**: Validación de precios, fechas, etc.
- **Sanitización**: Limpieza de datos de entrada
- **Manejo de errores**: Responses estructurados y seguros

## 📝 Variables de entorno

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `PORT` | No | Puerto del servidor | `4000` |
| `NODE_ENV` | No | Entorno de ejecución | `development` |
| `DB_URI` | ✅ | Conexión a MongoDB | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | ✅ | Clave secreta JWT (min 32 chars) | `abc123...` |
| `JWT_EXPIRATION` | No | Expiración del token | `24h` |
| `ARCJET_KEY` | ✅ | Clave API de Arcjet | `ajkey_...` |
| `ARCJET_ENV` | No | Entorno de Arcjet | `DEVELOPMENT` |

## 🏗️ Arquitectura del proyecto

### 📁 Estructura de Directorios
```
├── app.js                      # Punto de entrada principal
├── package.json                # Dependencias y scripts
├── babel.config.json          # Configuración de Babel
├── jest.config.js             # Configuración de Jest
├── eslint.config.js           # Configuración de ESLint
├── 
├── config/                     # ⚙️ Configuraciones
│   ├── env.js                 #   Variables de entorno
│   ├── arcjet.js              #   Configuración de Arcjet
│   └── swagger.js             #   Configuración de Swagger
├── 
├── controllers/               # 🎮 Controladores HTTP
│   ├── auth.controller.js     #   Autenticación
│   ├── user.controller.js     #   Gestión de usuarios
│   └── subscription.controller.js # Gestión de suscripciones
├── 
├── database/                  # 🗄️ Base de datos
│   └── mongodb.js             #   Configuración de MongoDB
├── 
├── middlewares/               # 🔗 Middlewares
│   ├── auth.middleware.js     #   Autenticación JWT
│   ├── arcjet.middleware.js   #   Seguridad Arcjet
│   ├── error.middleware.js    #   Manejo de errores
│   ├── logger.middleware.js   #   Logging de requests
│   └── validation.middleware.js # Validación de datos
├── 
├── models/                    # 📋 Modelos de datos
│   ├── user.model.js          #   Modelo de Usuario
│   └── subscription.model.js  #   Modelo de Suscripción
├── 
├── routes/                    # 🛣️ Definición de rutas
│   ├── auth.routes.js         #   Rutas de autenticación
│   ├── user.route.js          #   Rutas de usuarios
│   └── subscription.routes.js #   Rutas de suscripciones
├── 
├── services/                  # 🔧 Lógica de negocio
│   ├── auth.service.js        #   Servicios de autenticación
│   ├── user.service.js        #   Servicios de usuarios
│   └── subscription.service.js #   Servicios de suscripciones
├── 
├── validators/                # ✅ Validadores
│   └── subscription.validators.js # Validaciones de suscripciones
├── 
├── tests/                     # 🧪 Testing
│   ├── setup.js               #   Configuración de tests
│   └── unit/                  #   Tests unitarios
│       ├── basic.test.js      #     Tests básicos
│       ├── services/          #     Tests de servicios
│       └── validators/        #     Tests de validadores
├── 
├── scripts/                   # 📜 Utilidades
│   ├── create-test-user.js    #   Crear usuario de prueba
│   ├── generate-jwt-secret.js #   Generar JWT secret
│   ├── get-testing-token.js   #   Obtener token para tests
│   └── test-db-connection.js  #   Probar conexión DB
└── 
└── docs/                      # 📚 Documentación
    ├── AUTH_FIX_SUMMARY.md    #   Resumen de correcciones
    ├── FINAL_TESTING_STRUCTURE.md # Estructura de testing
    ├── ROUTES_DOCUMENTATION_VERIFICATION.md # Verificación de rutas
    ├── TESTING_SCRIPTS_CLEANUP.md # Limpieza de scripts
    └── TESTING_STRATEGY.md    #   Estrategia de testing
```

### 🧩 Patrones de Arquitectura
- **MVC Pattern**: Separación clara de responsabilidades
- **Service Layer**: Lógica de negocio encapsulada
- **Middleware Pattern**: Funcionalidades transversales
- **Repository Pattern**: Abstracción de acceso a datos
- **Error Handling**: Manejo centralizado de errores
- **Dependency Injection**: Configuración modular

## 🤝 Contribuir

### 📋 Proceso de Contribución
1. **Fork** el proyecto
2. **Crear rama feature** (`git checkout -b feature/NuevaCaracteristica`)
3. **Commit cambios** (`git commit -m 'Agregar nueva característica'`)
4. **Push a la rama** (`git push origin feature/NuevaCaracteristica`)
5. **Abrir Pull Request**

### 🎯 Guías de Desarrollo
- **Seguir el patrón MVC** establecido
- **Escribir tests** para nuevas funcionalidades
- **Documentar en Swagger** nuevos endpoints
- **Usar ESLint** para mantener consistencia
- **Validar datos** en todos los endpoints
- **Manejar errores** apropiadamente

### 🔍 Código de Calidad
- **Cobertura de tests**: Mínimo 80%
- **Linting**: Sin errores de ESLint
- **Documentación**: Swagger actualizado
- **Validación**: Todos los inputs validados
- **Seguridad**: Revisar vulnerabilidades

## 📈 Estado del Proyecto

### ✅ Completamente Implementado
- **API REST completa** con todos los endpoints
- **Autenticación JWT** con registro y login
- **Gestión de suscripciones** con CRUD completo
- **Documentación Swagger** interactiva
- **Sistema de seguridad** con Arcjet
- **Testing unitario** configurado
- **Scripts de desarrollo** y utilidades

### 🚀 Próximas Mejoras
- **Dashboard web** (frontend)
- **Notificaciones** de vencimiento
- **Reportes PDF** de gastos
- **Integración con APIs** de bancos
- **App móvil** con React Native
- **Análisis de gastos** con ML

## 🔗 Enlaces Útiles

- **Swagger UI**: http://localhost:4000/api-docs
- **MongoDB Compass**: Para visualizar la base de datos
- **Arcjet Dashboard**: https://app.arcjet.com
- **Postman Collection**: Importar desde Swagger

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

1. **Revisa la documentación** en `/docs`
2. **Consulta Swagger UI** para la API
3. **Ejecuta los scripts de testing** para verificar configuración
4. **Abre un issue** para reportar bugs

**¡Desarrollado con ❤️ para hacer el tracking de suscripciones más fácil!**
