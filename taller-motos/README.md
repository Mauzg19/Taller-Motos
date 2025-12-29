# Taller de Motos - Gestión (Demo)

Proyecto demo con Spring Boot para gestionar órdenes de taller de motos y seguimiento en tiempo real (SSE).

Características clave:
- Registro de órdenes con número único.
- Datos del cliente y de la moto.
- Motivo de ingreso y diagnóstico inicial.
- Progreso del servicio con estados: DIAGNOSTICO, REPARACION, ESPERANDO_REPUESTOS, LISTO_PARA_ENTREGAR, ENTREGADO.
- Streaming en tiempo real (SSE) para notificar cambios de estado a clientes conectados.

- Endpoints principales (REST API):
- GET /api/orders -> Lista de órdenes (JSON)
- POST /api/orders -> Crear orden (JSON)
- PUT /api/orders/{id}/status -> Actualizar estado (JSON {"estado":"REPARACION"})
- GET /api/orders/stream -> SSE endpoint para recibir actualizaciones (evento "orden-update")
- GET /api/orders -> Lista de órdenes (JSON)
- POST /api/orders -> Crear orden (JSON)
- PUT /api/orders/{id}/status -> Actualizar estado (JSON {"estado":"REPARACION"})
- GET /api/orders/stream -> SSE endpoint para recibir actualizaciones (evento "orden-update")

Ejecutar localmente (Windows PowerShell):

- Backend (Spring Boot):
```
cd c:\Users\Lenovo\Videos\taller-motos\taller-motos
./mvnw spring-boot:run
```

- Frontend (carpeta separada `frontend/`): abrir `frontend/index.html` con un servidor web simple, por ejemplo:
```
cd c:\Users\Lenovo\Videos\taller-motos\frontend
python -m http.server 3000
```
o usando node `http-server`:
```
npx http-server -p 3000
```

Nota: El frontend hace peticiones a `http://localhost:8080/api` por defecto, ajusta `API_ORIGIN` si tu backend corre en otra dirección.

Notas:
- La app ahora usa MySQL por defecto; puedes lanzar un contenedor local con docker-compose:

```
docker-compose up -d
```

Esto crea una base de datos MySQL en `jdbc:mysql://localhost:3306/tallermotos` con usuario `root` y contraseña `password`.

- Configuración de datasource por variables de entorno (fallbacks por defecto):
	- SPRING_DATASOURCE_URL
	- SPRING_DATASOURCE_USERNAME
	- SPRING_DATASOURCE_PASSWORD

- Seguridad en modo desarrollo: las rutas públicas del API están permitidas (CORS desde `*`); para producción configura seguridad y CORS apropiadamente.
