# 🎮 Champions Game - Versión Optimizada y Profesional

## 🌟 Características Principales

### ✨ Nuevo en esta Versión
- 🔐 **Autenticación JWT segura**
- 🛡️ **Protección contra ataques** (Rate limiting, NoSQL injection, XSS)
- ⚡ **Performance mejorado** (Code splitting, lazy loading)
- 📊 **Sistema de logging profesional**
- 🎯 **Validación exhaustiva de datos**
- 🔄 **Gestión de estado con Zustand**PORT=8080
- 🚨 **Error boundaries y manejo de errores**
- 📝 **Auditoría de acciones críticas**

---

## 🚀 Quick Start

### Opción 1: Instalación Automática (Recomendada)

```powershell
# Ejecutar desde la raíz del proyecto
.\install-optimizations.ps1
```

### Opción 2: Instalación Manual

#### Backend
```bash
cd Backend
npm install
npm install jsonwebtoken helmet express-rate-limit
```

Crear `Backend/.env`:
```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/champions-game
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRATION=7d
LOG_LEVEL=DEBUG
```

#### Frontend
```bash
cd Frontend
npm install
npm install zustand
```

Crear `Frontend/.env`:
```env
VITE_API_URL=http://localhost:8080
```

---

## 🏃 Cómo Ejecutar

### 1. Iniciar MongoDB
```bash
mongod
```

### 2. Iniciar Backend
```bash
cd Backend
npm run dev
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:8080
📡 API disponible en http://localhost:8080/api
```

### 3. Iniciar Frontend (en otra terminal)
```bash
cd Frontend
npm run dev
```

Deberías ver:
```
➜  Local:   http://localhost:5173/
```

### 4. Abrir en navegador
```
http://localhost:5173
```

---

## 📁 Estructura del Proyecto

```
champions-game/
├── Backend/
│   ├── config/              # Configuración (DB)
│   ├── controllers/         # Lógica de negocio
│   ├── middleware/          # ✨ NUEVO
│   │   ├── auth.js         # Autenticación JWT
│   │   ├── validation.js   # Validaciones
│   │   └── rateLimit.js    # Rate limiting
│   ├── models/             # Modelos de MongoDB
│   ├── repo/               # DAOs
│   ├── routes/             # Rutas de API
│   ├── services/           # Servicios externos
│   ├── utils/              # ✨ NUEVO
│   │   ├── logger.js       # Sistema de logging
│   │   └── security.js     # Utilidades de seguridad
│   ├── .env                # Variables de entorno
│   └── index.js            # Punto de entrada
│
├── Frontend/
│   ├── src/
│   │   ├── api/            # ✨ NUEVO
│   │   │   └── client.js   # Cliente HTTP
│   │   ├── components/     
│   │   │   └── ErrorBoundary.jsx  # ✨ NUEVO
│   │   ├── pages/          # Páginas de la app
│   │   ├── store/          # ✨ NUEVO
│   │   │   ├── authStore.js     # Estado de auth
│   │   │   └── gameStore.js     # Estado del juego
│   │   ├── utils/          # Utilidades
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Punto de entrada
│   ├── .env                # Variables de entorno
│   └── vite.config.js      # Configuración de Vite
│
└── Documentación/
    ├── OPTIMIZATION_GUIDE.md       # Guía completa
    ├── CHANGES_SUMMARY.md          # Resumen de cambios
    ├── VERIFICATION_CHECKLIST.md   # Lista de verificación
    └── install-optimizations.ps1   # Script de instalación
```

---

## 🔐 Sistema de Autenticación

### Registro
```http
POST /api/users
Content-Type: application/json

{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "Segura123"
}
```

**Requisitos**:
- Username: 3-50 caracteres, alfanumérico
- Email: Formato válido
- Password: 8+ caracteres, mayúsculas, minúsculas, números

**Respuesta**:
```json
{
  "message": "Usuario creado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "usuario123",
    "email": "usuario@example.com"
  }
}
```

### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "Segura123"
}
```

**Respuesta**: Igual que registro, incluye `token`.

### Usar Token en Peticiones
```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ Seguridad Implementada

### 🔒 Protecciones Activas

| Ataque | Protección | Implementación |
|--------|-----------|----------------|
| **Brute Force** | Rate Limiting | 5 intentos/15min en login |
| **DoS/DDoS** | Rate Limiting Global | 100 req/15min por IP |
| **NoSQL Injection** | Sanitización de Regex | `escapeRegex()` en búsquedas |
| **XSS** | Helmet Headers | CSP, X-Frame-Options |
| **Token Hijacking** | JWT con expiración | 7 días por defecto |
| **User Enumeration** | Mensajes genéricos | "Credenciales inválidas" |
| **Weak Passwords** | Validación estricta | 8+ chars, mayús, minús, nums |

### 🔑 Hashing de Contraseñas
- Algoritmo: **bcrypt**
- Rounds: **10**
- Salt: Generado automáticamente

### 🎫 JWT Configuration
- Algorithm: **HS256**
- Expiration: **7 días** (configurable)
- Secret: Almacenado en `.env`

---

## 📊 API Endpoints

### Públicos (sin autenticación)
- `POST /api/users` - Registro
- `POST /api/users/login` - Login
- `GET /api/games` - Listar juegos
- `GET /api/games/:id` - Obtener juego
- `GET /api/games/random` - Juego aleatorio

### Protegidos (requieren JWT)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `POST /api/games` - Crear juego
- `PUT /api/games/:id` - Actualizar juego
- `DELETE /api/games/:id` - Eliminar juego
- `POST /api/games/import` - Importar juegos

---

## ⚡ Optimizaciones de Performance

### Backend
- ✅ Logging eficiente con niveles
- ✅ Validación optimizada
- ✅ Índices en MongoDB
- ✅ Rate limiting para prevenir sobrecarga

### Frontend
- ✅ **Code Splitting**: Chunks separados
  - `vendor`: React & React DOM
  - `state-management`: Zustand
  - `http-client`: Axios
- ✅ **Lazy Loading**: Componentes bajo demanda
- ✅ **Zustand**: Estado ligero (<1KB)
- ✅ **useCallback**: Optimización de renders
- ✅ **Terser**: Minificación avanzada
- ✅ **Tree Shaking**: Eliminación de código muerto

### Métricas Esperadas
- **Initial Load**: < 3 segundos
- **Bundle Size**: < 500KB
- **Time to Interactive**: < 4 segundos

---

## 🧪 Testing

### Probar Rate Limiting
```powershell
# Windows PowerShell
1..6 | ForEach-Object {
  Invoke-RestMethod -Uri "http://localhost:8080/api/users/login" `
    -Method POST `
    -Body '{"username":"test","password":"test"}' `
    -ContentType "application/json"
}
```

Después del 5º intento → Error 429

### Probar JWT
```powershell
# 1. Login y guardar token
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/login" `
  -Method POST `
  -Body '{"username":"tu_usuario","password":"tu_password"}' `
  -ContentType "application/json"

$token = $response.token

# 2. Usar token en petición protegida
Invoke-RestMethod -Uri "http://localhost:8080/api/users" `
  -Headers @{Authorization="Bearer $token"}
```

---

## 📝 Logs

### Niveles
- **ERROR**: Errores críticos
- **WARN**: Advertencias (intentos fallidos, etc.)
- **INFO**: Información general (usuario creado, login exitoso)
- **DEBUG**: Información detallada de debugging

### Ejemplo de Salida
```
[2024-01-15T10:30:45.123Z] [INFO] Usuario creado: johndoe
[2024-01-15T10:30:45.124Z] [INFO] AUDIT: CREATE on User {"userId":"...","username":"johndoe"}
[2024-01-15T10:31:22.456Z] [INFO] Login exitoso: johndoe
[2024-01-15T10:32:10.789Z] [WARN] Intento de login con contraseña incorrecta para: johndoe
```

---

## 🚨 Solución de Problemas

### "Token no proporcionado"
**Causa**: No estás enviando el token JWT
**Solución**: Asegúrate de hacer login primero y que el token esté en localStorage

### "Demasiadas peticiones"
**Causa**: Rate limit alcanzado
**Solución**: Espera 15 minutos o reinicia el servidor

### "No se pudo conectar con el servidor"
**Causa**: Backend no está corriendo o URL incorrecta
**Solución**: 
1. Verifica que backend esté en `http://localhost:8080`
2. Revisa `VITE_API_URL` en `Frontend/.env`

### Error de validación
**Causa**: Datos no cumplen requisitos
**Solución**: Lee el mensaje de error y ajusta los datos

---

## 📚 Documentación Completa

Para información detallada sobre las optimizaciones:

- **[OPTIMIZATION_GUIDE.md](OPTIMIZATION_GUIDE.md)** - Guía completa de optimizaciones
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Resumen de todos los cambios
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Lista de verificación paso a paso

---

## 🤝 Contribuir

Si encuentras bugs o tienes sugerencias:

1. Revisa los logs del backend
2. Revisa la consola del navegador
3. Verifica variables de entorno
4. Consulta la documentación

---

## 📄 Licencia

[Tu licencia aquí]

---

## 👨‍💻 Autor

[Tu nombre aquí]

---

**¡Disfruta de tu Champions Game optimizado y profesional! 🎮🚀**
