# Publicar HACHI en internet (gratis)

HACHI queda publicado en una sola dirección (por ejemplo `https://hachi.vercel.app`) usando dos servicios gratuitos que **no se duermen**:

| Pieza | Servicio | Plan |
| --- | --- | --- |
| Frontend (React) + backend (Express) | **Vercel** | Hobby (gratis) |
| Base de datos MySQL | **TiDB Cloud** (compatible con MySQL) | Starter / Serverless (gratis, 5 GB) |

El backend corre en Vercel como función serverless en `/api` y el frontend se sirve en el mismo dominio, así que no hay que configurar CORS ni URLs del backend.

Archivos que hacen esto posible: [`vercel.json`](../vercel.json) y [`api/index.js`](../api/index.js).

---

## Paso 1. Crear la base de datos en TiDB Cloud

1. Entrar a <https://tidbcloud.com> y crear una cuenta (con Google o GitHub).
2. **Create Cluster → Starter (Serverless)**, que es el plan gratuito.
   - Proveedor: **AWS**.
   - Región: **N. Virginia (us-east-1)**. Es la misma región donde Vercel ejecuta el backend; elegir otra agrega retraso en cada consulta.
3. Al terminar, abrir el cluster → **Connect**:
   - *Connect With*: **General**.
   - Presionar **Generate Password** y copiarla de inmediato (solo se muestra una vez).
   - Anotar **Host**, **Port** (4000) y **User** (tiene la forma `xxxxxxxx.root`).

## Paso 2. Crear las tablas y el administrador (desde tu computadora)

1. En la carpeta `backend/`, crear el archivo **`.env.nube`** (git lo ignora, no se sube):

   ```env
   DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
   DB_PORT=4000
   DB_USER=xxxxxxxx.root
   DB_PASSWORD=la-contraseña-generada
   DB_NAME=hachi_db
   DB_SSL=true
   ```

2. En PowerShell, dentro de `backend/`:

   ```powershell
   $env:DOTENV_CONFIG_PATH=".env.nube"

   # Tablas + datos de prueba. Agrega -- --reportes para cargar también el historial de los reportes
   npm run inicializar-bd

   # Usuario administrador para entrar al panel
   npm run crear-admin -- "Nombre Apellido" admin@hachi.com "ContrasenaSegura"

   Remove-Item Env:DOTENV_CONFIG_PATH
   ```

   `inicializar-bd` se puede ejecutar varias veces: no duplica datos.

## Paso 3. Generar el secreto de las sesiones

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Guarda el resultado: es el `JWT_SECRET` de producción. **No uses el mismo que en tu `.env` local.**

## Paso 4. Publicar en Vercel

> **Importante:** el repositorio `hachi-io2s-2026/hachi-io2s` es **privado y de una organización**. El plan gratuito de Vercel **no puede conectarse** a ese tipo de repositorio. Hay dos caminos:
>
> - **A. Publicar desde tu computadora con la CLI de Vercel** (recomendado; no cambia nada del repositorio).
> - **B. Hacer público el repositorio** (lo decide quien administra la organización). Así Vercel se conecta a GitHub y publica solo en cada push a `main`.

### Opción A: con la CLI (desde la raíz del proyecto)

```powershell
npx vercel login
npx vercel link        # crear proyecto nuevo, nombre: hachi. Directorio: ./ (la raíz)
```

Cargar las variables de entorno de producción. Cada comando pide el valor:

```powershell
npx vercel env add DB_HOST production
npx vercel env add DB_PORT production        # 4000
npx vercel env add DB_USER production
npx vercel env add DB_PASSWORD production
npx vercel env add DB_NAME production        # hachi_db
npx vercel env add DB_SSL production         # true
npx vercel env add DB_CONEXIONES production  # 3
npx vercel env add JWT_SECRET production     # el del paso 3
npx vercel env add JWT_EXPIRES_IN production # 8h
```

Publicar:

```powershell
npx vercel --prod
```

Al terminar muestra la dirección pública. Para publicar cambios más adelante, vuelve a ejecutar `npx vercel --prod` desde `main` actualizado.

### Opción B: repositorio público

En <https://vercel.com/new> importar el repositorio, dejar **Root Directory** en la raíz (`./`) y cargar las mismas variables del paso anterior en **Environment Variables**. `vercel.json` ya indica cómo instalar, compilar y dónde está el frontend.

## Paso 5. Comprobar

- `https://TU-DOMINIO.vercel.app/api/health` debe responder `{"success":true,...}`.
- Entrar a `https://TU-DOMINIO.vercel.app/login` con el administrador del paso 2.

---

## Notas

- **Hora del hotel:** el servidor de Vercel está en UTC, pero el backend calcula "hoy" y las horas de entrada/salida en hora de Guatemala (`America/Guatemala`) y la base usa `-06:00`. No hay que configurar nada.
- **Límites gratuitos:** de sobra para la feria y para pruebas. Vercel Hobby es para uso no comercial; si HACHI se usara como negocio real habría que pasar a un plan de pago.
- **Actualizar la base** cuando se agreguen columnas nuevas: volver a ejecutar `npm run inicializar-bd -- --solo-esquema` con `.env.nube` (solo agrega lo que falta).
- **Errores:** en Vercel → proyecto → **Logs** aparecen los errores del backend.
