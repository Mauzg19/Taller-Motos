# Frontend React - Taller de Motos

Frontend moderno construido con React, Vite y TailwindCSS para el sistema de gestión de taller de motos.

## 🚀 Instalación

```bash
cd frontend-react
npm install
```

## 🛠️ Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor correrá en http://localhost:3000
# Las peticiones a /api se proxyean al backend en http://localhost:8080
```

## 📦 Build de Producción

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── api/              # Clientes de API
├── components/       # Componentes reutilizables
├── context/          # Contextos de React (Auth, etc.)
├── pages/            # Páginas principales
├── App.jsx           # Configuración de rutas
├── main.jsx          # Punto de entrada
└── index.css         # Estilos globales con Tailwind
```

## 🎨 Páginas Incluidas

| Página | Ruta | Descripción |
|--------|------|-------------|
| Login | `/login` | Autenticación de usuarios |
| Dashboard | `/dashboard` | Vista principal con métricas |
| Órdenes | `/ordenes` | Gestión de órdenes de servicio |
| Detalle Orden | `/ordenes/:id` | Vista detallada de orden |
| Clientes | `/clientes` | Gestión de clientes |
| Citas | `/citas` | Calendario de citas |
| Inventario | `/inventario` | Gestión de repuestos |
| Reportes | `/reportes` | Reportes y estadísticas |
| Portal Cliente | `/portal/:orden` | Vista pública del estado de la orden |

## 🔑 Credenciales de Demo

- **Admin:** `admin` / `admin123`
- **Cliente:** `cliente@example.com` / `cliente123`

## 📊 Características

- ✅ Diseño responsive con TailwindCSS
- ✅ Gráficos interactivos con Recharts
- ✅ Notificaciones toast con react-hot-toast
- ✅ Estado global con Zustand
- ✅ Streaming en tiempo real con SSE
- ✅ Portal del cliente público para seguimiento de órdenes

## 🔌 Endpoints del Backend

El frontend espera el backend corriendo en `http://localhost:8080`.

Principales endpoints:
- `/api/auth/login` - Autenticación
- `/api/dashboard/*` - Datos del dashboard
- `/api/ordenes/*` - Gestión de órdenes
- `/api/loyalty/clientes/*` - Gestión de clientes
- `/api/citas/*` - Gestión de citas
- `/api/reports/*` - Reportes
- `/api/notifications/*` - Notificaciones
