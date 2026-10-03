# `test-simple-stock-flow-tool`

Herramienta CLI sembradora de datos de prueba para **Simple Stock Flow**.

## Regla de Arquitectura
Esta herramienta consume **exclusivamente la API REST HTTP** de `test-simple-stock-flow-api`. No se conecta directamente a MySQL.

## Uso
```bash
# 1. Configurar variables de entorno
cp .env.example .env

# 2. Ejecutar el sembrado
npm run seed
```
