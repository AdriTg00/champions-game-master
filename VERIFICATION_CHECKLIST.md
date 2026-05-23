# ✅ Lista de Verificación - Champions Game Optimizado

## 📋 Pre-instalación

- [ ] Node.js instalado (v16 o superior)
- [ ] npm instalado
- [ ] MongoDB instalado y corriendo
- [ ] Git instalado (opcional)
- [ ] Editor de código (VS Code recomendado)

---

## 🔧 Instalación

### Backend
- [ ] Navegar a carpeta `Backend`
- [ ] Ejecutar `npm install`
- [ ] Verificar que se instalaron:
  - [ ] `jsonwebtoken`
  - [ ] `helmet`
  - [ ] `express-rate-limit`
- [ ] Crear archivo `Backend/.env`
- [ ] Configurar variables:
  - [ ] `PORT=8080`
  - [ ] `NODE_ENV=development`
  - [ ] `MONGO_URI=mongodb://localhost:27017/champions-game`
  - [ ] `JWT_SECRET` (cambiar valor por defecto)
  - [ ] `JWT_EXPIRATION=7d`
  - [ ] `LOG_LEVEL=DEBUG`

### Frontend
- [ ] Navegar a carpeta `Frontend`
- [ ] Ejecutar `npm install`
- [ ] Verificar que se instaló:
  - [ ] `zustand`
- [ ] Crear archivo `Frontend/.env`
- [ ] Configurar variable:
  - [ ] `VITE_API_URL=http://localhost:8080`

---

## 📁 Archivos Nuevos

### Backend
- [ ] `Backend/middleware/auth.js` existe
- [ ] `Backend/middleware/validation.js` existe
- [ ] `Backend/middleware/rateLimit.js` existe
- [ ] `Backend/utils/logger.js` existe
- [ ] `Backend/utils/security.js` existe

### Frontend
- [ ] `Frontend/src/store/authStore.js` existe
- [ ] `Frontend/src/store/gameStore.js` existe
- [ ] `Frontend/src/api/client.js` existe
- [ ] `Frontend/src/components/ErrorBoundary.jsx` existe

### Documentación
- [ ] `OPTIMIZATION_GUIDE.md` existe
- [ ] `CHANGES_SUMMARY.md` existe
- [ ] `VERIFICATION_CHECKLIST.md` existe (este archivo)
- [ ] `install-optimizations.ps1` existe

---

## 🚀 Inicio de Servidores

### Backend
- [ ] Abrir terminal en carpeta `Backend`
- [ ] Ejecutar `npm run dev`
- [ ] Verificar mensaje:
  ```
  ✅ Servidor corriendo en http://localhost:8080
  📡 API disponible en http://localhost:8080/api
  ```
- [ ] No hay errores en consola
- [ ] MongoDB conectado exitosamente

### Frontend
- [ ] Abrir NUEVA terminal en carpeta `Frontend`
- [ ] Ejecutar `npm run dev`
- [ ] Verificar mensaje:
  ```
  ➜  Local:   http://localhost:5173/
  ```
- [ ] No hay errores en consola
- [ ] Compilación exitosa

---

## 🧪 Tests Funcionales

### 1. Registro de Usuario
- [ ] Abrir `http://localhost:5173`
- [ ] Hacer clic en "Crear cuenta"
- [ ] Intentar registrar con username corto (< 3 chars)
  - [ ] Debería mostrar error de validación
- [ ] Intentar registrar con contraseña débil (< 8 chars)
  - [ ] Debería mostrar error de validación
- [ ] Registrar usuario válido:
  - Username: `testuser123`
  - Email: `test@example.com`
  - Password: `Test1234`
- [ ] Registro exitoso
- [ ] Redirige a login automáticamente

### 2. Login
- [ ] Hacer clic en "Entrar"
- [ ] Intentar login con credenciales incorrectas
  - [ ] Debería mostrar "Credenciales inválidas"
- [ ] Login con credenciales correctas
- [ ] Login exitoso
- [ ] Redirige a pantalla principal

### 3. Verificar JWT
- [ ] Abrir DevTools (F12)
- [ ] Ir a Application → Storage → Local Storage
- [ ] Verificar que existe `auth-storage`
- [ ] Verificar que contiene:
  - [ ] `user` con datos del usuario
  - [ ] `token` con JWT
  - [ ] `isAuthenticated: true`
- [ ] Verificar que existe `authToken` separado

### 4. Juego
- [ ] Hacer clic en "Comenzar"
- [ ] Se cargan los juegos
- [ ] Aparecen 2 cartas de juegos
- [ ] Hacer clic en un juego
- [ ] El juego seleccionado sube a "campeón"
- [ ] Aparece nuevo contrincante
- [ ] Contador de elecciones incrementa
 - [ ] Después de 25 elecciones → va a ranking

### 5. Ranking
- [ ] Pantalla de ranking aparece
- [ ] Muestra juegos ordenados por votos
- [ ] Botón "Reiniciar" funciona
- [ ] Vuelve a pantalla principal

---

## 🔐 Tests de Seguridad

### 1. Rate Limiting - Login
- [ ] Abrir terminal
- [ ] Ejecutar 6 intentos de login rápidamente:
  ```powershell
  1..6 | ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:8080/api/users/login" `
      -Method POST `
      -Body '{"username":"fake","password":"fake"}' `
      -ContentType "application/json"
  }
  ```
- [ ] A partir del 6º intento debe dar error 429
- [ ] Mensaje: "Demasiados intentos de login"

### 2. JWT Verification
- [ ] Hacer GET a ruta protegida sin token:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8080/api/users"
  ```
- [ ] Debe dar error 401 "Token no proporcionado"
- [ ] Hacer GET con token válido:
  ```powershell
  $token = "TU_TOKEN_AQUI"
  Invoke-RestMethod -Uri "http://localhost:8080/api/users" `
    -Headers @{Authorization="Bearer $token"}
  ```
- [ ] Debe devolver lista de usuarios

### 3. Validación de Datos
- [ ] Intentar crear usuario con email inválido:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8080/api/users" `
    -Method POST `
    -Body '{"username":"test","email":"invalid","password":"Test1234"}' `
    -ContentType "application/json"
  ```
- [ ] Debe dar error 400 con detalle de validación

---

## 📊 Tests de Performance

### Frontend
- [ ] Abrir DevTools → Network
- [ ] Recargar página (Ctrl+R)
- [ ] Verificar que archivos JS están separados:
  - [ ] `vendor-*.js` (React)
  - [ ] `state-management-*.js` (Zustand)
  - [ ] `http-client-*.js` (Axios)
- [ ] Verificar tamaño total < 500KB
- [ ] Tiempo de carga inicial < 3 segundos

### Backend
- [ ] Verificar logs en consola con colores
- [ ] Logs muestran timestamps
- [ ] Niveles de log (INFO, WARN, ERROR) funcionan
- [ ] AUDIT logs aparecen en acciones importantes

---

## 🐛 Tests de Error Handling

### Frontend
- [ ] Detener backend
- [ ] Intentar hacer login en frontend
- [ ] Debería mostrar error de conexión amigable
- [ ] Reiniciar backend
- [ ] Login debería funcionar nuevamente

### Error Boundary
- [ ] Simular error en componente (modificar código temporalmente)
- [ ] Error Boundary captura el error
- [ ] Muestra pantalla de error amigable
- [ ] Botón "Recargar página" funciona

---

## 📝 Logs y Monitoreo

### Backend Console
- [ ] Al crear usuario:
  ```
  [INFO] Usuario creado: testuser123
  [AUDIT: CREATE on User]
  ```
- [ ] Al hacer login:
  ```
  [INFO] Login exitoso: testuser123
  [AUDIT: LOGIN on User]
  ```
- [ ] Al intentar login incorrecto:
  ```
  [WARN] Intento de login con contraseña incorrecta para: testuser123
  ```

### Frontend Console
- [ ] En modo desarrollo, ver logs de API:
  ```
  [API] POST /api/users/login
  [API] Response 200: {...}
  ```
- [ ] No hay errores en consola
- [ ] Warnings esperados (si los hay) están documentados

---

## 🌐 Tests de CORS

- [ ] Backend acepta peticiones desde `http://localhost:5173`
- [ ] Backend acepta peticiones desde `https://championsweb.adriantarancon.dev`
- [ ] Backend rechaza peticiones de otros orígenes
- [ ] Headers CORS correctos en respuestas

---

## 🔄 Estado y Persistencia

### Zustand Store
- [ ] Auth store persiste en localStorage
- [ ] Al refrescar página (F5):
  - [ ] Usuario sigue logueado
  - [ ] Token sigue presente
  - [ ] No pide login nuevamente
- [ ] Al hacer logout:
  - [ ] localStorage se limpia
  - [ ] Redirige a login
  - [ ] No puede acceder a rutas protegidas

### Game Store
- [ ] Estado del juego se mantiene durante sesión
- [ ] Contador de votos funciona correctamente
- [ ] Al reiniciar juego, estado se resetea

---

## 📱 Tests de Responsividad (Opcional)

- [ ] Abrir DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- [ ] Probar en:
  - [ ] Mobile (375x667)
  - [ ] Tablet (768x1024)
  - [ ] Desktop (1920x1080)
- [ ] UI se adapta correctamente
- [ ] Botones son clickeables
- [ ] Texto es legible

---

## ✅ Checklist Final

### Backend
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ MongoDB conectado
- [ ] ✅ JWT funcionando
- [ ] ✅ Rate limiting activo
- [ ] ✅ Validaciones funcionando
- [ ] ✅ Logs apareciendo correctamente
- [ ] ✅ CORS configurado
- [ ] ✅ Helmet headers activos

### Frontend
- [ ] ✅ Aplicación inicia sin errores
- [ ] ✅ Zustand stores funcionando
- [ ] ✅ Cliente axios configurado
- [ ] ✅ Error boundary funcionando
- [ ] ✅ Code splitting activo
- [ ] ✅ Lazy loading funcionando
- [ ] ✅ Login/Registro funcionan
- [ ] ✅ Juego funciona correctamente

### Seguridad
- [ ] ✅ Contraseñas hasheadas
- [ ] ✅ JWT con expiración
- [ ] ✅ Rate limiting probado
- [ ] ✅ Validaciones probadas
- [ ] ✅ NoSQL injection prevenida
- [ ] ✅ CORS restringido

### Performance
- [ ] ✅ Build optimizado
- [ ] ✅ Chunks separados
- [ ] ✅ Lazy loading activo
- [ ] ✅ Sin re-renders innecesarios

---

## 🎯 Resultado Esperado

Si todos los items están marcados ✅, tu proyecto está:

✨ **COMPLETAMENTE OPTIMIZADO Y FUNCIONAL** ✨

---

## 🆘 Si algo falló

1. Revisa la sección específica de este checklist
2. Consulta `OPTIMIZATION_GUIDE.md` para detalles
3. Revisa logs de backend y frontend
4. Verifica variables de entorno
5. Reinstala dependencias si es necesario

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
