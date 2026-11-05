# API RESTful - Centro de Salud

> **Trabajo Práctico Final - Curso de Backend Developer**  
> **Centro de e-Learning UTN BA**

---

## 1. Descripción del Proyecto

API RESTful robusta, modular y escalable para la gestión integral de un **Centro de Salud**, desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)**. 

El sistema implementa una arquitectura en capas que respeta estrictamente el principio de separación de responsabilidades:
- **Controladores (`controllers/`)**: Ligeros, encargados únicamente de recibir solicitudes HTTP, invocar la capa de servicios y retornar códigos y respuestas JSON estructuradas.
- **Capa de Servicios (`services/`)**: Centraliza toda la lógica de negocio, validaciones de reglas de dominio y llamadas directas a Mongoose/MongoDB.
- **Modelos (`models/`)**: Definición de esquemas, relaciones (`ref` y `populate`), subdocumentos embebidos e índices de rendimiento.
- **Seguridad**: Encriptación de contraseñas con `bcrypt` (vía pre-save hook en Mongoose) y protección de endpoints sensibles mediante tokens JWT (`verifyToken`).

---

## 2. Esquema de la Base de Datos (Estructura de Colecciones)

La base de datos se estructura en cuatro colecciones optimizadas para alto rendimiento en lectura y consistencia:

### A. Colección `usuarios`
Gestiona la autenticación y el control de accesos al sistema según el rol:
- `_id`: ObjectId
- `email`: String (Único, formato email)
- `password`: String (Hash generado con bcrypt)
- `rol`: Enum `['ADMIN', 'PROFESIONAL', 'PACIENTE']`
- `activo`: Boolean (default: `true`)
- `perfil_id`: ObjectId (Referencia polimórfica a la colección `pacientes` o `profesionales`, o `null` si es `ADMIN`)
- `perfil_ref`: String (`'Paciente'`, `'Profesional'` o `null`)
- `ultimo_login`: Date
- `fecha_creacion` / `fecha_actualizacion`: Timestamps

### B. Colección `pacientes`
Almacena los datos personales e historia clínica:
- `_id`: ObjectId
- `nombre`: String
- `apellido`: String
- `dni`: String (Único)
- `fecha_nacimiento`: Date
- `contacto`: Object embebido (`email`, `telefono`, `direccion`)
- `historia_clinica`: Subdocumento embebido (1 a 1) (`fecha_creacion`, `antecedentes[]`, `alergias[]`, `observaciones`)
- `usuario_id`: ObjectId (Referencia opcional a `Usuario`)

### C. Colección `profesionales`
Almacena los profesionales médicos y sus especialidades:
- `_id`: ObjectId
- `nombre`: String
- `apellido`: String
- `matricula`: String (Única)
- `contacto`: Object embebido (`email`, `telefono`)
- `especialidades`: Array de subdocumentos embebidos (`nombre`, `descripcion`)
- `usuario_id`: ObjectId (Referencia opcional a `Usuario`)

### D. Colección `turnos`
Colección independiente que vincula pacientes con profesionales mediante referencias:
- `_id`: ObjectId
- `paciente_id`: ObjectId (Referencia a `Paciente`) - *Utiliza `.populate()`*
- `profesional_id`: ObjectId (Referencia a `Profesional`) - *Utiliza `.populate()`*
- `especialidad`: String
- `fecha_hora`: Date
- `estado`: Enum `['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'ATENDIDO']`
- `motivo`: String

---

## 3. Tecnologías Utilizadas

- **Entorno de ejecución:** Node.js (v18+)
- **Framework Web:** Express.js (v4.x)
- **Base de Datos NoSQL:** MongoDB
- **ODM:** Mongoose (v8.x)
- **Seguridad y Encriptación:** `bcryptjs`
- **Autenticación:** `jsonwebtoken` (JWT)
- **Variables de Entorno:** `dotenv`
- **Políticas de Origen Cruzado:** `cors`
- **Desarrollo:** `nodemon`

---

## 4. Estructura del Proyecto

```
backend/
├── app.js                     # Configuración de Express, middlewares y rutas
├── index.js                   # Punto de entrada, conexión a DB y arranque del servidor
├── .env                       # Variables de entorno
├── .env.example               # Plantilla de variables de entorno
├── package.json               # Dependencias y scripts de ejecución
├── ejemplos.json              # Datos de prueba Mock en formato BSON/JSON
├── README.md                  # Documentación completa
└── src/
    ├── config/
    │   └── db.js              # Conexión a MongoDB con Mongoose
    ├── models/
    │   ├── userModel.js       # Modelo con pre-save hook de bcrypt
    │   ├── pacienteModel.js   # Modelo con historia clínica embebida
    │   ├── profesionalModel.js# Modelo con especialidades embebidas
    │   └── turnoModel.js      # Modelo con referencias a paciente y profesional
    ├── services/
    │   ├── userService.js     # Lógica de login, hash y CRUD de usuarios
    │   ├── pacienteService.js # Lógica de negocio y queries de pacientes
    │   ├── profesionalService.js # Lógica de negocio de profesionales
    │   └── turnoService.js    # Lógica de turnos con validaciones y populate
    ├── controllers/
    │   ├── userController.js  # Manejo HTTP para usuarios y auth
    │   ├── pacienteController.js # Manejo HTTP para pacientes
    │   ├── profesionalController.js # Manejo HTTP para profesionales
    │   └── turnoController.js # Manejo HTTP para turnos
    ├── routes/
    │   ├── userRoute.js       # Rutas /api/usuarios
    │   ├── pacienteRoute.js   # Rutas /api/pacientes
    │   ├── profesionalRoute.js# Rutas /api/profesionales
    │   └── turnoRoute.js      # Rutas /api/turnos
    ├── middleware/
    │   └── verifyToken.js     # Verificación de JWT y autorización por rol
    └── scripts/
        └── seed.js            # Script para poblar la DB desde ejemplos.json
```

---

## 5. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
- Tener una instancia local de **MongoDB** activa (`mongodb://localhost:27017`) o un clúster en **MongoDB Atlas**.

### Paso 1: Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd backend
npm install
```

### Paso 2: Configurar variables de entorno
Copie el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Verifique y edite los valores en `.env` si es necesario:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/centro_salud
JWT_SECRET=clave_secreta_jwt_centro_salud_2026
JWT_EXPIRES_IN=24h
```

### Paso 3: Sembrar la Base de Datos con datos iniciales (Opcional pero recomendado)
Ejecute el script de seed para cargar automáticamente todos los pacientes, profesionales, turnos y usuarios iniciales definidos en `ejemplos.json`:
```bash
npm run seed
```

### Paso 4: Iniciar la aplicación

- **Backend + Frontend React (Integrado):**
  ```bash
  npm run dev
  ```
  Abra su navegador en `http://localhost:3000` para acceder a la aplicación web completa en React.

- **Frontend en modo Desarrollo Vite (Hot-Reloading independiente):**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  El servidor de desarrollo de Vite estará disponible en `http://localhost:5173`, con proxy configurado hacia la API en el puerto 3000.

### Paso 5: Ejecutar Tests Unitarios y de Integración

El proyecto cuenta con una suite completa de pruebas utilizando **Jest** y **Supertest**:

- **Ejecutar todos los tests:**
  ```bash
  npm test
  ```
- **Ejecutar solo tests unitarios (Servicios y Middlewares aislados con mocks):**
  ```bash
  npm run test:unit
  ```
- **Ejecutar tests de integración (Endpoints HTTP y flujos de autenticación):**
  ```bash
  npm run test:integration
  ```
- **Ver reporte de cobertura de código:**
  ```bash
  npm run test:coverage
  ```

---

## 6. Listado Completo de Endpoints (Rutas)

### Autenticación y Usuarios (`/api/usuarios`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/usuarios/register` | Registrar un nuevo usuario | Público |
| `POST` | `/api/usuarios/login` | Iniciar sesión y obtener token JWT | Público |
| `GET` | `/api/usuarios` | Listar todos los usuarios | Protegido (`ADMIN`) |
| `GET` | `/api/usuarios/:id` | Obtener datos de un usuario por ID | Protegido (`JWT`) |
| `PUT` | `/api/usuarios/:id` | Modificar datos de usuario | Protegido (`JWT`) |
| `DELETE`| `/api/usuarios/:id` | Eliminar un usuario | Protegido (`ADMIN`) |

### Pacientes (`/api/pacientes`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pacientes` | Listar pacientes (soporta filtros `dni`, `nombre`, `apellido`) | Público |
| `GET` | `/api/pacientes/:id` | Obtener paciente por ID con su historia clínica | Público |
| `POST` | `/api/pacientes` | Registrar un nuevo paciente | Protegido (`JWT`) |
| `PUT` | `/api/pacientes/:id` | Actualizar datos del paciente o historia clínica | Protegido (`JWT`) |
| `DELETE`| `/api/pacientes/:id` | Eliminar un paciente | Protegido (`JWT`) |

### Profesionales (`/api/profesionales`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profesionales` | Listar profesionales (soporta filtros `matricula`, `especialidad`) | Público |
| `GET` | `/api/profesionales/:id` | Obtener profesional por ID y sus especialidades | Público |
| `POST` | `/api/profesionales` | Registrar un nuevo profesional médico | Protegido (`JWT`) |
| `PUT` | `/api/profesionales/:id` | Actualizar datos del profesional | Protegido (`JWT`) |
| `DELETE`| `/api/profesionales/:id` | Eliminar un profesional | Protegido (`JWT`) |

### Turnos (`/api/turnos`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/turnos` | Listar turnos con `populate` de Paciente y Profesional | Protegido (`JWT`) |
| `GET` | `/api/turnos/:id` | Obtener detalle de turno con datos relacionados | Protegido (`JWT`) |
| `POST` | `/api/turnos` | Agendar un nuevo turno (valida disponibilidad) | Protegido (`JWT`) |
| `PUT` | `/api/turnos/:id` | Modificar turno (estado, fecha/hora, motivo) | Protegido (`JWT`) |
| `DELETE`| `/api/turnos/:id` | Cancelar/Eliminar turno | Protegido (`JWT`) |

*Nota: Para consumir endpoints protegidos, envíe la cabecera HTTP:*  
`Authorization: Bearer <SU_TOKEN_JWT>`

---

## 7. Ejemplos de Datos Mock (JSON) para Solicitudes

### 1. Iniciar Sesión (`POST /api/usuarios/login`)
**Body:**
```json
{
  "email": "carlos.rodriguez@hospital.com",
  "password": "Password123!"
}
```
**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "_id": "60d5ecb8b5c9c22b5c8e4031",
      "email": "carlos.rodriguez@hospital.com",
      "rol": "PROFESIONAL",
      "activo": true,
      "perfil_id": "60d5ecb8b5c9c22b5c8e4010"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Registrar Paciente (`POST /api/pacientes`)
**Headers:** `Authorization: Bearer <TOKEN>`  
**Body:**
```json
{
  "nombre": "Ana",
  "apellido": "Martínez",
  "dni": "40123987",
  "fecha_nacimiento": "1997-08-20T00:00:00Z",
  "contacto": {
    "email": "ana.martinez@email.com",
    "telefono": "+541165432109",
    "direccion": "Av. Santa Fe 2345, CABA"
  },
  "historia_clinica": {
    "antecedentes": ["Rinitis alérgica"],
    "alergias": ["Ibuprofeno"],
    "observaciones": "Primera consulta ambulatoria"
  }
}
```

### 3. Registrar Profesional (`POST /api/profesionales`)
**Headers:** `Authorization: Bearer <TOKEN>`  
**Body:**
```json
{
  "nombre": "Martín",
  "apellido": "Suárez",
  "matricula": "MN-99441",
  "contacto": {
    "email": "martin.suarez@hospital.com",
    "telefono": "+541188889999"
  },
  "especialidades": [
    {
      "nombre": "Traumatología",
      "descripcion": "Especialista en lesiones óseas y articulares"
    }
  ]
}
```

### 4. Crear un Turno (`POST /api/turnos`)
**Headers:** `Authorization: Bearer <TOKEN>`  
**Body:**
```json
{
  "paciente_id": "60d5ecb8b5c9c22b5c8e4001",
  "profesional_id": "60d5ecb8b5c9c22b5c8e4010",
  "especialidad": "Cardiología",
  "fecha_hora": "2026-11-05T11:00:00Z",
  "estado": "CONFIRMADO",
  "motivo": "Control electrocardiograma"
}
```

---

## 8. Funcionalidades Implementadas y a Futuro

### Implementadas
- [x] Arquitectura limpia en capas (Controlador -> Servicio -> Modelo).
- [x] CRUD completo para las 4 entidades: Pacientes, Profesionales, Turnos y Usuarios.
- [x] Pre-save hook de Mongoose para hasheo seguro de contraseñas con bcrypt.
- [x] Generación y validación de tokens JWT con middleware reutilizable.
- [x] Autorización basada en roles (`ADMIN`, `PROFESIONAL`, `PACIENTE`).
- [x] Relaciones con `populate` en la lectura de turnos.
- [x] Subdocumentos embebidos (Historia clínica en Pacientes, Especialidades en Profesionales).
- [x] Manejo de CORS y variables de entorno centralizadas con `dotenv`.
- [x] Seeder automático (`npm run seed`) a partir de `ejemplos.json`.
- [x] Códigos de respuesta HTTP semánticos (200, 201, 400, 401, 403, 404, 409, 500).

### A Futuro
- [ ] Recordatorios automáticos de turnos por email / WhatsApp (Nodemailer / Twilio).
- [ ] Paginación dinámica en listas extensas de turnos y pacientes.
- [ ] Carga y almacenamiento de archivos adjuntos (estudios médicos en PDF/imágenes) en Amazon S3.
- [ ] Integración con frontend web en React/Next.js.

---

## 9. Archivo `.env` de Ejemplo

El repositorio incluye el archivo `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/centro_salud
JWT_SECRET=supersecreto_jwt_centro_salud_2026
JWT_EXPIRES_IN=24h
```
