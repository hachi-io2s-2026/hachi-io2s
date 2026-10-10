# 🐾 HACHI — Sistema de Gestión para Hotel Canino

Proyecto universitario de la Feria EMI 2026 — Facultad de Ingeniería, Universidad de San Carlos de Guatemala.

HACHI es un prototipo web para administrar **propietarios, mascotas, reservaciones, hospedaje nocturno, daycare (cuidado diurno), tarifas y reportes**.

## 1. Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Base de datos | MySQL |
| Conexión MySQL | `mysql2` |
| Control de versiones | Git + GitHub |

## 2. Requisitos previos

Para usar se necesita instalar:

- **Git:** https://git-scm.com/downloads
- **Node.js LTS (incluye npm):** https://nodejs.org/
- **Visual Studio Code:** https://code.visualstudio.com/
- **MySQL Server:** https://dev.mysql.com/downloads/mysql/
- **MySQL Workbench** (recomendado): https://dev.mysql.com/downloads/workbench/

Verificar que el servicio de **MySQL Server esté encendido**. El puerto local predeterminado es `3306` (puede cambiar según la instalación).


## 3. Estructura del repositorio

```text
HACHI/
├── frontend/              # React + Vite
│   ├── src/
│   └── package.json
├── backend/               # Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── database/              # Scripts SQL versionados
├── docs/                  # Documentación y diagramas
├── .gitignore
└── README.md
```

## 4. Primer uso: clonar el repositorio

## 5. Instalar y ejecutar el frontend

Abrir una terminal en la raíz del proyecto:

```powershell
cd frontend
npm i
npm run dev
```

Abrir la dirección que imprima Vite, normalmente **http://localhost:5173**.

- Dejar esta terminal abierta mientras se usa el frontend.
- Detenerlo con **Ctrl + C**.

## 6. Configurar MySQL

### 6.1 Crear la base de datos

Abrir **MySQL Workbench**, conectarse al servidor MySQL local y ejecutar el script SQL que esté versionado en `database/` (`database/01_create_database.sql`).

Si todavía no hay un script de inicialización disponible, para una primera prueba puede ejecutarse:

```sql
CREATE DATABASE IF NOT EXISTS hachi_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 6.2 Credenciales locales

Usar una cuenta MySQL local que tenga permisos sobre `hachi_db`. El director técnico puede proporcionar el script de creación de un usuario `hachi_app` (con una contraseña elegida **localmente**, nunca compartida en el repositorio). No es necesario usar `root` desde la aplicación.

## 7. Instalar y ejecutar el backend

Abrir **otra terminal** (dejar corriendo la del frontend):

```powershell
cd backend
npm ci
```

### 7.1 Crear el archivo `.env`

En PowerShell, dentro de `backend/`:

```powershell
Copy-Item .env.example .env
```

O duplicar `backend/.env.example` manualmente y renombrar la copia a `.env`.

Ejemplo de contenido (usar las credenciales de **tu propio MySQL**):

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=hachi_app
DB_PASSWORD=TU_CONTRASENA_LOCAL
DB_NAME=hachi_db
```

### 7.2 Iniciar la API

Desde `backend/`:

```powershell
npm run dev
```

El backend debería iniciar normalmente en **http://localhost:3000**.

Con la implementación inicial acordada, probar:

- **http://localhost:3000/api/health**: confirma que Express responde.
- **http://localhost:3000/api/test-db**: ejecuta una consulta a MySQL **solo si el endpoint temporal de diagnóstico está implementado**. No dejar este endpoint público en producción.

### 7.3 Comprobar compilación

Dentro de `backend/`:

```powershell
npm run build
```

## 8. Cómo trabajar con Git y GitHub

### Regla fundamental

**No trabajar ni hacer `push` directo a `main`.** Cada cambio debe desarrollarse en una rama y llegar a `main` mediante un **Pull Request (PR)** revisado.

### 8.1 Nombres de ramas

Formato: `feature/nombre-descriptivo`, en minúsculas y con guiones.

Para tareas posteriores, crear ramas específicas: `feature/login`, `feature/registro-mascotas`, etc. Otras convenciones permitidas: `fix/descripcion` para errores, `docs/descripcion` para documentación y `chore/descripcion` para mantenimiento.

### 8.2 Antes de comenzar una tarea

Desde la **raíz** del repositorio:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/reservas
```

Cambiar `feature/reservas` por el nombre de tu tarea. `git switch -c` es solo para **crear una rama nueva**; si ya existe localmente, usa `git switch feature/reservas`.

### 8.3 Guardar y subir cambios

```powershell
git status
git add frontend/src backend/src
git commit -m "feat: agregar registro de reservaciones"
git push -u origin feature/reservas
```

### 8.4 Crear un Pull Request

1. Entrar a GitHub y abrir el repositorio.
2. Ir a **Pull requests → New pull request** (o pulsar **Compare & pull request**).
3. Seleccionar **base: `main`** y **compare: tu rama**.
4. Incluir: **qué se implementó**, **qué archivos/módulos se tocaron**, **cómo probarlo**, capturas si aplica y pendientes conocidos.
5. Solicitar revisión.
6. Corregir observaciones mediante nuevos commits en la misma rama.
7. Integrar solo cuando el PR esté aprobado y no presente conflictos o errores de compilación.

No usar `git push --force` ni resolver conflictos eliminando trabajo ajeno sin coordinación.

### 8.5 Si `main` avanzó mientras trabajabas

Guardar tus cambios antes de actualizar, y ejecutar desde tu rama:

```powershell
git fetch origin
git merge origin/main
```

Si hay conflictos, resolverlos en los archivos afectados, revisar y completar el merge. Pedir ayuda si el conflicto afecta modelos, tablas o código de otro integrante.

### 8.6 Al terminar un PR

```powershell
git switch main
git pull --ff-only origin main
```

Crear una **nueva rama** para la siguiente tarea. Las ramas pueden borrarse tras integrarlas si ya no son necesarias.
