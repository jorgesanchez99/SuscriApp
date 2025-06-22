# Scripts de Testing - Estructura Limpia y Lógica

## ¿Por qué había redundancia antes?

### Problemas anteriores:
1. **`generate-test-token.js`** generaba tokens "artificiales" sin hacer login real
2. **`create-test-user.js`** redefinía esquemas de MongoDB en lugar de usar modelos existentes
3. **Múltiples scripts** hacían lo mismo de diferentes maneras
4. **Inconsistencias** entre cómo se generaban y verificaban tokens

## Nueva estructura simplificada

### 🎯 **Scripts Esenciales** (3 scripts, lógica clara)

#### 1. `npm run test:user` → `create-test-user.js`
**Propósito**: Crear/verificar usuario dedicado para testing
```bash
# ¿Cuándo usar?
# - Primera vez que configuras el proyecto
# - Cuando necesitas resetear el usuario de prueba
npm run test:user
```

**Mejoras aplicadas**:
- ✅ Usa `AuthService` y `UserService` (no redefine esquemas)
- ✅ Manejo automático de hash de contraseñas
- ✅ Verificación antes de crear (no duplica usuarios)

#### 2. `npm run test:token` → `get-testing-token.js` ⭐
**Propósito**: Obtener token JWT real haciendo login
```bash
# ¿Cuándo usar?
# - Para testing en Swagger UI
# - Para testing con curl
# - Cuando necesitas un token válido rápidamente
npm run test:token
```

**Ventajas**:
- ✅ **Token REAL** (no artificial)
- ✅ Usa el flujo completo de `AuthService.signIn()`
- ✅ Token listo para copiar/pegar en Swagger
- ✅ Incluye ejemplos de uso

#### 3. `npm run test:auth` → `test-auth-flow.js`
**Propósito**: Verificar que todo el sistema de autenticación funcione
```bash
# ¿Cuándo usar?
# - Para debugging de problemas de autenticación
# - Para verificar que cambios no rompieron nada
# - Para testing completo del flujo
npm run test:auth
```

### 🗑️ **Scripts eliminados/deprecados**

#### ❌ `generate-test-token.js` (movido a `.OLD`)
**Por qué se eliminó**:
- Generaba tokens "artificiales" que podían causar inconsistencias
- Si puedes hacer login real, ¿para qué generar tokens falsos?
- Causaba confusión sobre cuál script usar

#### ❌ Redefinición de esquemas MongoDB
**Antes**: Cada script redefinía esquemas
```javascript
// ❌ MALO - Redefinir en cada script
const userSchema = new mongoose.Schema({...});
```

**Ahora**: Usar servicios existentes
```javascript
// ✅ BUENO - Usar servicios
import AuthService from '../services/auth.service.js';
import UserService from '../services/user.service.js';
```

## Flujo de trabajo recomendado

### Para testing en Swagger:
```bash
# 1. Crear usuario (solo la primera vez)
npm run test:user

# 2. Obtener token
npm run test:token
# → Copia el token que aparece

# 3. En Swagger UI:
# - Clic en "Authorize" 🔒
# - Pegar token completo
# - Clic en "Authorize"
# - ¡Listo para probar endpoints!
```

### Para desarrollo/debugging:
```bash
# Verificar conexión DB
npm run test:db

# Verificar flujo completo
npm run test:auth

# Login manual con credenciales
npm run test:login
```

## Credenciales de testing

**Usuario dedicado para pruebas**:
- 📧 **Email**: `test@suscripciontracker.dev`
- 🔐 **Password**: `TestPassword123!`
- 👤 **Nombre**: Usuario Pruebas

**Ventajas**:
- ✅ Datos conocidos y consistentes
- ✅ No interfiere con usuarios reales
- ✅ Fácil de identificar en logs
- ✅ Se puede resetear sin problemas

## Comparación: Antes vs Ahora

### ❌ **Antes (confuso)**:
```bash
npm run test:user        # ¿Crea usuario?
npm run test:token       # ¿Token real o falso?
npm run test:login       # ¿Es diferente al anterior?
npm run test:auth        # ¿Qué hace este?
```

### ✅ **Ahora (claro)**:
```bash
npm run test:user        # Crear/verificar usuario de prueba
npm run test:token       # Obtener token REAL (login)
npm run test:auth        # Verificar todo funciona
```

## Resultado

- **🎯 Simplicidad**: 3 scripts esenciales con propósitos claros
- **🔒 Confiabilidad**: Solo tokens reales, no artificiales
- **♻️ Reutilización**: Usa servicios existentes, no duplica código
- **📚 Claridad**: Cada script tiene un propósito específico y bien documentado

¡El sistema ahora es mucho más simple, confiable y fácil de entender!
