# Frontend (Separado)

Este directorio contiene la UI estática que consume la API REST del backend. 

Instrucciones rápidas (usar un servidor estático simple):

```
cd frontend
python -m http.server 3000
```

Accediendo: http://localhost:3000

Si el backend corre en otra dirección, exporta `API_ORIGIN`, por ejemplo:

```
# Windows PowerShell
$env:API_ORIGIN = 'http://localhost:8080'
npx http-server -p 3000
```
