# CUTANEO - Sistema de Reservas de Depilación

Una aplicación web full-stack, moderna y minimalista diseñada específicamente para el centro de estética **CUTANEO** para gestionar reservas de depilación de manera sencilla, elegante y funcional.

El sistema está construido como una aplicación unificada utilizando **Next.js** (App Router), **Prisma ORM**, **SQLite** (base de datos local autónoma) y **Tailwind CSS**.

---

## 🚀 Características Principales

### Para los Clientes:
1. **Página de Inicio Premium**: Presentación elegante del centro con accesos directos e interactivos.
2. **Flujo de Reserva Paso a Paso**: 
   - Selector de fecha dinámico (bloquea automáticamente Miércoles, Sábados, Domingos y fechas pasadas).
   - Selector de horarios interactivo en base a turnos fijos de **45 minutos** (12:00 hs a 19:00 hs, siendo 18:00 hs el último turno que finaliza 18:45 hs).
   - Formulario de datos con validaciones estrictas en tiempo real.
3. **Gestión de Turnos Personalizada**:
   - Acceso seguro mediante correo electrónico.
   - Consulta del historial completo de reservas (Reservados, Cancelados, Reprogramados).
   - Botón de **Cancelación instantánea** (libera el horario automáticamente en el sistema).
   - Botón de **Reprogramación interactiva** (permite elegir una nueva fecha y horario libre, conservando el historial).

### Para el Administrador (`/admin`):
1. **Acceso Privado Seguro**: Login con usuario y contraseña protegidos mediante variables de entorno y JWT en sesión.
2. **Métricas en Tiempo Real**: Panel con contadores de Reservas Totales, Activas, Canceladas y Reprogramadas.
3. **Tabla de Control**: Visualización de ID, Nombre del cliente, Email, Teléfono, Fecha del turno, Horario, Estado de reserva con etiquetas de color y marcas de tiempo de creación/cancelación.
4. **Filtros Avanzados**: Búsqueda instantánea por estado de turno y por fecha específica.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend & Backend**: Next.js 15+ (App Router con TypeScript y API Routes).
- **Base de Datos**: SQLite (almacenamiento local en archivo `dev.db`, ideal para ejecución rápida sin dependencias).
- **ORM**: Prisma 5.20.0 (estabilidad garantizada para SQLite local sin requerir compiladores nativos en Windows).
- **Estilos**: Tailwind CSS v4 (diseño moderno, paleta de colores Ivory neutra y efectos de Glassmorphism).
- **Iconografía**: Lucide React.
- **Autenticación**: JSON Web Tokens (JWT) y cookies HTTP-only para mayor seguridad.

---

## 📋 Requisitos Previos

- Tener instalado **Node.js** (versión 18 o superior recomendada).
- Gestor de paquetes **npm** (incluido por defecto con Node.js).

---

## ⚙️ Configuración e Instalación

Sigue estos sencillos pasos para iniciar el proyecto en tu entorno local:

### 1. Clonar o acceder al directorio del proyecto
Asegúrate de estar posicionado en la raíz del proyecto `Cutaneo2/`.

### 2. Instalar las dependencias
Ejecuta el siguiente comando para instalar todos los paquetes necesarios de forma limpia:
```bash
npm install
```

### 3. Configurar las variables de entorno
El archivo `.env` ya ha sido creado en la raíz del proyecto con la configuración recomendada:
```env
# Base de datos local SQLite
DATABASE_URL="file:./dev.db"

# Credenciales para el Panel de Administrador (/admin)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Clave secreta para firmar tokens JWT de administración
JWT_SECRET="cutaneo_super_secret_session_key_2026"
```
*Puedes cambiar `ADMIN_USERNAME` y `ADMIN_PASSWORD` en cualquier momento según tus preferencias.*

### 4. Inicializar la Base de Datos y aplicar las Migraciones
Ejecuta el siguiente comando para crear automáticamente el archivo de base de datos local SQLite (`prisma/dev.db`) y configurar las tablas según el esquema:
```bash
npx prisma migrate dev --name init
```

### 5. Sembrar Datos de Prueba (Seed)
Para que no inicies con una aplicación vacía, hemos creado un script para sembrar datos realistas de prueba. Ejecuta el comando:
```bash
node prisma/seed.js
```
Esto creará **7 registros de prueba** con combinaciones de turnos reservados, cancelados y reprogramados en fechas futuras y de hoy.

---

## 💻 Ejecución del Servidor de Desarrollo

Una vez completados los pasos anteriores, enciende el servidor de desarrollo local corriendo:
```bash
npm run dev
```

La aplicación estará lista y disponible en tu navegador en:
- **Área de Clientes**: [http://localhost:3000](http://localhost:3000)
- **Panel Administrativo**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Credenciales por Defecto (Admin)

Para iniciar sesión en el panel administrativo `/admin`, introduce:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

---

## 📌 Reglas de Reserva & Flujo de Datos

- **Días de Atención**: Lunes, Martes, Jueves y Viernes. (Miércoles, Sábados y Domingos deshabilitados).
- **Horario**: 12:00 a 19:00 hs.
- **Duración del Turno**: 45 minutos. Los horarios exactos que ofrece el sistema de forma fija son:
  `12:00`, `12:45`, `13:30`, `14:15`, `15:00`, `15:45`, `16:30`, `17:15`, `18:00`.
- **Validación del Pasado**: El sistema impide reservar en el pasado (tanto fechas anteriores como horarios del día de hoy que ya hayan transcurrido).
- **Doble Reserva**: El sistema no permite que dos usuarios agenden el mismo día y horario con estado activo (`reserved`).
