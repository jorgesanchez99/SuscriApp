# Suscripción Tracker API

Una API REST para el seguimiento y gestión de suscripciones personales.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Gestión de usuarios
- ✅ Tracking de suscripciones
- ✅ Seguridad con Arcjet (rate limiting, bot detection)
- ✅ Validación robusta de datos
- ✅ Manejo centralizado de errores

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

## 🏃‍♂️ Ejecutar la aplicación

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📚 API Endpoints

### Autenticación
- `POST /api/v1/auth/sign-up` - Registro de usuario
- `POST /api/v1/auth/sign-in` - Inicio de sesión
- `POST /api/v1/auth/sign-out` - Cerrar sesión

### Usuarios
- `GET /api/v1/users` - Obtener todos los usuarios
- `GET /api/v1/users/:id` - Obtener usuario por ID

### Suscripciones
- `POST /api/v1/subscriptions` - Crear suscripción
- `GET /api/v1/subscriptions/users/:id` - Obtener suscripciones del usuario

## 🔧 Scripts disponibles

```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm run lint       # Verificar código con ESLint
```

## 🛡️ Seguridad

- **Autenticación JWT**: Tokens seguros para autenticación
- **Rate Limiting**: Protección contra spam y ataques DoS
- **Bot Detection**: Detección y bloqueo de bots maliciosos
- **Validación de datos**: Validación exhaustiva en modelos
- **Hash de contraseñas**: Encriptación con bcrypt

## 📝 Variables de entorno

| Variable | Requerida | Descripción | Ejemplo |
|----------|-----------|-------------|---------|
| `PORT` | No | Puerto del servidor | `3000` |
| `NODE_ENV` | No | Entorno de ejecución | `development` |
| `DB_URI` | ✅ | Conexión a MongoDB | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | ✅ | Clave secreta JWT (min 32 chars) | `abc123...` |
| `JWT_EXPIRATION` | No | Expiración del token | `24h` |
| `ARCJET_KEY` | ✅ | Clave API de Arcjet | `ajkey_...` |
| `ARCJET_ENV` | No | Entorno de Arcjet | `DEVELOPMENT` |

## 🏗️ Estructura del proyecto

```
├── app.js                 # Punto de entrada
├── config/                # Configuraciones
│   ├── env.js            # Variables de entorno
│   └── arject.js         # Configuración de Arcjet
├── controllers/           # Controladores HTTP
├── database/             # Configuración de BD
├── middlewares/          # Middlewares personalizados
├── models/               # Modelos de Mongoose
└── routes/               # Definición de rutas
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
