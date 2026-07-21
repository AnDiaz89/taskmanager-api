# Task Manager API

API REST para gestión de tareas con autenticación de usuarios mediante JWT. Cada usuario tiene su propia lista de tareas privada, con soporte para prioridades y fechas límite.

**Demo en vivo:** https://taskmanager-api-j5j7.onrender.com
**Frontend conectado:** https://taskmanager-app-hazel.vercel.app

## Características

- Registro e inicio de sesión con JWT
- Contraseñas encriptadas con bcrypt
- CRUD completo de tareas (crear, leer, actualizar, eliminar)
- Rutas protegidas: cada usuario solo puede ver y modificar sus propias tareas
- Prioridad y fecha límite por tarea
- Validación de datos (formato de email, longitud de contraseña, campos obligatorios)
- Tests automatizados con Jest y Supertest

## Stack tecnológico

- **Node.js** + **Express**
- **PostgreSQL** (alojado en [Neon](https://neon.tech))
- **Prisma ORM**
- **JWT** (jsonwebtoken) para autenticación
- **bcryptjs** para hasheo de contraseñas
- **Jest** + **Supertest** para testing

## Endpoints

| Método | Ruta | Descripción | Requiere token |
|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/tasks` | Obtener tareas del usuario | Sí |
| POST | `/api/tasks` | Crear tarea | Sí |
| PUT | `/api/tasks/:id` | Actualizar tarea | Sí |
| DELETE | `/api/tasks/:id` | Eliminar tarea | Sí |

## Cómo correrlo localmente

1. Clona el repositorio:
```bash
git clone https://github.com/AnDiaz89/taskmanager-api.git
cd taskmanager-api
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz con:

DATABASE_URL="tu_connection_string_de_postgresql"
JWT_SECRET="tu_clave_secreta"

4. Aplica las migraciones de la base de datos:
```bash
npx prisma migrate dev
```

5. Inicia el servidor:
```bash
npm run dev
```

El servidor corre por defecto en `http://localhost:3000`.

## Correr los tests

```bash
npm test
```

## Lo que aprendí

Este proyecto fue mi primera vez configurando autenticación JWT desde cero y desplegando un backend con base de datos en producción. Los principales retos fueron manejar correctamente las variables de entorno entre el ambiente local y el de producción, y asegurar que las rutas protegidas verificaran correctamente la pertenencia de cada tarea a su usuario.