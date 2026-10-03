#!/usr/bin/env node

/**
 * Sembrador de datos demo mediante consumo de API REST HTTP.
 * NO se conecta directamente a la Base de Datos.
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'cajero@stockflow.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`[${res.status}] Error en ${endpoint}: ${error}`);
    }

    return res.json();
}

async function runSeeder() {
    console.log('====================================================');
    console.log(' [Simple Stock Flow Tool] Sembrando datos vía HTTP  ');
    console.log(` Conectando a API: ${API_BASE_URL}`);
    console.log('====================================================');

    // 1. Iniciar sesión para obtener token
    console.log('\n[1/3] Autenticando usuario...');
    let token = null;
    let userId = 1;

    try {
        const authData = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });
        token = authData.token;
        userId = authData.user.id;
        console.log(`  -> Autenticación exitosa. Token JWT obtenido para usuario ID ${userId}.`);
    } catch (err) {
        console.warn(`  [AVISO] No se pudo autenticar (${err.message}). Continuando con modo demo.`);
    }

    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // 2. Sembrar Productos
    console.log('\n[2/3] Registrando catálogo de productos demo...');
    const demoProducts = [
        { sku: 'PROD-ARROZ-01', name: 'Arroz Diana 1kg', price: 4500, stock: 50, category_id: 1, description: 'Arroz blanco premium' },
        { sku: 'PROD-ACEITE-02', name: 'Aceite Premier 1L', price: 9800, stock: 30, category_id: 1, description: 'Aceite vegetal comestible' },
        { sku: 'PROD-LECHE-03', name: 'Leche Entera Alquería 1L', price: 4200, stock: 40, category_id: 2, description: 'Leche entera pasteurizada' },
        { sku: 'PROD-CAFE-04', name: 'Café Juan Valdez 500g', price: 18500, stock: 25, category_id: 1, description: 'Café molido colombiano' },
        { sku: 'PROD-PAN-05', name: 'Pan Tajado Bimbo', price: 6500, stock: 15, category_id: 3, description: 'Pan blanco familiar' },
    ];

    const createdProductIds = [];
    for (const prod of demoProducts) {
        try {
            const res = await request('/products', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(prod),
            });
            const pId = res.data ? res.data.id : res.id;
            createdProductIds.push(pId);
            console.log(`  -> Creado producto: ${prod.name} (SKU: ${prod.sku}, Stock: ${prod.stock})`);
        } catch (err) {
            console.log(`  -> Producto ya existe o error: ${prod.sku} (${err.message})`);
        }
    }

    // 3. Simular Ventas
    console.log('\n[3/3] Registrando ventas de prueba (verificando descuento atómico de stock)...');
    try {
        const salePayload = {
            user_id: userId,
            items: [
                { product_id: createdProductIds[0] || 1, quantity: 2 },
                { product_id: createdProductIds[1] || 2, quantity: 1 },
            ],
        };

        const saleRes = await request('/sales', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(salePayload),
        });

        console.log(`  -> Venta registrada con éxito: #${saleRes.id || saleRes.data?.id} por $${saleRes.total || saleRes.data?.total} COP`);
    } catch (err) {
        console.log(`  [AVISO] Venta de prueba: ${err.message}`);
    }

    console.log('\n====================================================');
    console.log(' [OK] Proceso de sembrado HTTP finalizado con éxito ');
    console.log('====================================================');
}

runSeeder().catch((err) => {
    console.error('\n[ERROR FATAL]', err.message);
    process.exit(1);
});
