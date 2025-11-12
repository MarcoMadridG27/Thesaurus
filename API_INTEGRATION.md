# Integración de APIs

Este proyecto está conectado con las siguientes APIs:

## APIs Configuradas

### 1. API de Autenticación (Login/Registro)
- **URL**: `http://44.212.163.253:3000/`
- **Endpoints**:
  - `POST /login` - Inicio de sesión
    - Body: `{ email: string, password: string }`
    - Response: `{ access_token: string, token_type: "bearer", expires_in: number }`
  
  - `POST /register` - Registro de nuevos usuarios
    - Body: `{ ruc: string, email: string, password: string }`
    - Response: `{ success: boolean, message: string, data: { ruc: string, razon_social: string } }`
  
  - `POST /validate-ruc` - Validar RUC con SUNAT
    - Body: `{ ruc: string }`
    - Response: Datos completos de la empresa de SUNAT
  
  - `GET /profile` - Obtener perfil de usuario
    - Headers: `Authorization: Bearer <token>`
    - Response: Datos completos de la empresa

### 2. API de OCR (Procesamiento de Facturas)
- **URL**: `http://44.212.163.253:8080/`
- **Endpoints**:
  - `POST /process` - Procesar una factura
  - `POST /process-batch` - Procesar múltiples facturas

## Configuración

Las URLs de las APIs están configuradas en el archivo `.env.local`:

```env
NEXT_PUBLIC_LOGIN_URL=http://44.212.163.253:3000/
NEXT_PUBLIC_OCR_URL=http://44.212.163.253:8080/
```

**Importante**: Las variables de entorno con el prefijo `NEXT_PUBLIC_` están disponibles en el lado del cliente (frontend).

## Uso en los Componentes

### Login (SignInForm)
El componente `components/auth/signin-form.tsx` ahora:
- Envía las credenciales (email y password) a la API de login
- Recibe un token JWT (`access_token`)
- Guarda el token de autenticación en localStorage
- Redirige al dashboard en caso de éxito
- Muestra mensajes de error cuando falla

### Registro (SignUpForm)
El componente `components/auth/signup-form.tsx` ahora:
- **Paso 1**: Valida el RUC con SUNAT antes de permitir el registro
  - Muestra información de la empresa (razón social, estado, condición)
  - Solo permite RUCs con estado ACTIVO y condición HABIDO
- **Paso 2**: Envía los datos de registro (RUC, email, password) a la API
- Valida que las contraseñas coincidan
- Hace login automático después del registro exitoso
- Guarda el token JWT en localStorage
- Redirige al dashboard
- Muestra mensajes de error detallados

**Campos requeridos:**
- **RUC**: 11 dígitos (validado con SUNAT)
- **Email**: Correo electrónico único
- **Password**: Contraseña
- **Confirm Password**: Confirmación de contraseña

### Carga de Facturas (InvoiceUploadArea)
El componente `components/dashboard/invoice-upload-area.tsx` ahora:
- Permite seleccionar múltiples archivos
- Muestra el estado de cada archivo (pendiente, procesando, éxito, error)
- Envía los archivos a la API de OCR
- Permite eliminar archivos antes de subirlos
- Muestra indicadores visuales del progreso

## Funciones de API Disponibles

El archivo `lib/api.ts` exporta las siguientes funciones:

```typescript
// Validar RUC con SUNAT
validateRuc(ruc: string)

// Iniciar sesión
loginUser(credentials: { email: string; password: string })

// Registrar usuario (incluye login automático)
signUpUser(userData: { ruc: string; email: string; password: string })

// Procesar una factura
processInvoice(file: File)

// Procesar múltiples facturas
processInvoices(files: File[])
```

## Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
pnpm dev
```

El servidor se iniciará en `http://localhost:3000`

## Flujo de Autenticación

### Registro:
1. Usuario ingresa RUC (11 dígitos)
2. Click en "Validar" → API consulta SUNAT
3. Si es válido, muestra datos de la empresa
4. Usuario completa email y contraseña
5. API crea la cuenta en la base de datos
6. Se hace login automático
7. Redirección al dashboard

### Login:
1. Usuario ingresa email y contraseña
2. API valida credenciales
3. Si son correctas, retorna token JWT
4. Token se guarda en localStorage
5. Redirección al dashboard

## Estructura de Respuestas de la API de Login

### Login exitoso:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Registro exitoso:
```json
{
  "success": true,
  "message": "Empresa registrada exitosamente",
  "data": {
    "ruc": "20123456789",
    "razon_social": "MI EMPRESA S.A.C."
  }
}
```

### Validación de RUC exitosa:
```json
{
  "ruc": "20123456789",
  "razon_social": "MI EMPRESA S.A.C.",
  "nombre_comercial": "MI EMPRESA",
  "estado": "ACTIVO",
  "condicion": "HABIDO",
  "direccion": "AV. EJEMPLO 123",
  "departamento": "LIMA",
  "provincia": "LIMA",
  "distrito": "MIRAFLORES"
}
```

### Error:
```json
{
  "detail": "Descripción del error"
}
```

## Notas Importantes

1. **CORS**: Asegúrate de que las APIs permitan peticiones desde tu dominio
2. **Tokens**: Los tokens JWT se guardan en localStorage con la clave "authToken"
3. **Expiración**: Los tokens expiran según la configuración del servidor (típicamente 24 horas)
4. **RUC**: Solo se aceptan RUCs peruanos de 11 dígitos
5. **Validación SUNAT**: La empresa debe estar ACTIVA y HABIDA
6. **Emails únicos**: No se permiten emails duplicados
7. **RUCs únicos**: No se permiten RUCs duplicados
8. **Formato de Archivos**: La carga de facturas acepta PDF, PNG, JPG (máx. 10MB)

## Seguridad

- Las contraseñas se envían hasheadas al backend
- Los tokens JWT incluyen información encriptada del usuario (RUC y email)
- Se verifica el estado de la cuenta (is_active) antes de permitir el login
- Se actualiza la fecha de último login en cada sesión
