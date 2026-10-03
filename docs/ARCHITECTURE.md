# Arquitectura de la Herramienta Sembradora (`test-simple-stock-flow-tool`)

## 1. Regla de Oro
Esta herramienta **NO se conecta a la base de datos MySQL directamente**.
Consume **exclusivamente la API REST pública** expuesta por `test-simple-stock-flow-api` mediante peticiones HTTP.

```
test-simple-stock-flow-tool
            │
            ▼ HTTP REST (POST /api/auth/login, POST /api/products, POST /api/sales)
test-simple-stock-flow-api
            │
            ▼
        MySQL 8.4
```

## 2. Flujo de Sembrado
1. Hace `POST /api/auth/login` con credenciales de administrador para obtener el token JWT.
2. Hace `POST /api/products` para registrar productos demo con sus SKUs y stocks iniciales.
3. Hace `POST /api/sales` para simular ventas y verificar el descuento automático de stock y la generación de reportes.
