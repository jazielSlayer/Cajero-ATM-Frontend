import { API_URL } from "../Api";

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/dashboard
 * Métricas generales del sistema.
 */
export const getDashboard = async () => {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener el dashboard");
    return await response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/usuarios
 * Lista completa de usuarios con datos de persona y rol.
 */
export const listarUsuarios = async () => {
    const response = await fetch(`${API_URL}/admin/usuarios`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al listar usuarios");
    return await response.json();
};

/**
 * GET /admin/usuario/:usuario_id
 * Detalle completo de un usuario: datos, cuentas y últimas transacciones.
 * @param {number|string} usuario_id
 */
export const obtenerUsuario = async (usuario_id) => {
    const response = await fetch(`${API_URL}/admin/usuario/${usuario_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener el usuario");
    return await response.json();
};

/**
 * PUT /admin/usuario/:usuario_id/estado
 * Cambia el estado de un usuario: activo | bloqueado | inactivo
 * @param {number|string} usuario_id
 * @param {"activo"|"bloqueado"|"inactivo"} estado
 */
export const cambiarEstadoUsuario = async (usuario_id, estado) => {
    const response = await fetch(`${API_URL}/admin/usuario/${usuario_id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
    });
    if (!response.ok) throw new Error("Error al cambiar estado del usuario");
    return await response.json();
};

/**
 * PUT /admin/usuario/:usuario_id/datos
 * Actualiza datos personales del usuario.
 * @param {number|string} usuario_id
 * @param {{ nombre?: string, apellido?: string, direccion?: string, telefono?: string, edad?: number }} datos
 */
export const actualizarDatosPersona = async (usuario_id, datos) => {
    const response = await fetch(`${API_URL}/admin/usuario/${usuario_id}/datos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error("Error al actualizar datos del usuario");
    return await response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// CUENTAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/cuentas
 * Lista todas las cuentas con resumen de saldo y tarjeta vinculada.
 */
export const listarCuentas = async () => {
    const response = await fetch(`${API_URL}/admin/cuentas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al listar cuentas");
    return await response.json();
};

/**
 * GET /admin/cuenta/:numero_cuenta/saldos
 * Saldos de una cuenta en todas las monedas.
 * @param {string} numero_cuenta
 */
export const getSaldosCuenta = async (numero_cuenta) => {
    const encoded = encodeURIComponent(numero_cuenta);
    const response = await fetch(`${API_URL}/admin/cuenta/${encoded}/saldos`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener saldos de la cuenta");
    return await response.json();
};

/**
 * GET /admin/usuario/:usuario_id/cuentas
 * Cuentas de un usuario.
 * @param {number|string} usuario_id
 */
export const getCuentasPorUsuario = async (usuario_id) => {
    const response = await fetch(`${API_URL}/admin/usuario/${usuario_id}/cuentas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener cuentas del usuario");
    return await response.json();
};

/**
 * PUT /admin/cuenta/:numero_cuenta/estado
 * Cambia el estado de una cuenta: activa | bloqueada | cerrada
 * @param {string} numero_cuenta
 * @param {"activa"|"bloqueada"|"cerrada"} estado
 */
export const cambiarEstadoCuenta = async (numero_cuenta, estado) => {
    const encoded = encodeURIComponent(numero_cuenta);
    const response = await fetch(`${API_URL}/admin/cuenta/${encoded}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
    });
    if (!response.ok) throw new Error("Error al cambiar estado de la cuenta");
    return await response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// TARJETAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/tarjetas
 * Lista todas las tarjetas registradas.
 */
export const listarTarjetas = async () => {
    const response = await fetch(`${API_URL}/admin/tarjetas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al listar tarjetas");
    return await response.json();
};

/**
 * GET /admin/tarjeta/:numero_tarjeta/cuentas
 * Cuentas vinculadas a una tarjeta.
 * @param {string} numero_tarjeta
 */
export const getCuentasPorTarjeta = async (numero_tarjeta) => {
    const encoded = encodeURIComponent(numero_tarjeta);
    const response = await fetch(`${API_URL}/admin/tarjeta/${encoded}/cuentas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener cuentas de la tarjeta");
    return await response.json();
};

/**
 * PUT /admin/tarjeta/:numero_tarjeta/estado
 * Cambia el estado de una tarjeta: activa | bloqueada | cancelada
 * @param {string} numero_tarjeta
 * @param {{ pin: string, nombre_completo: string, nuevo_estado: "activa"|"bloqueada"|"cancelada" }} datos
 */
export const cambiarEstadoTarjeta = async (numero_tarjeta, datos) => {
    const encoded = encodeURIComponent(numero_tarjeta);
    const response = await fetch(`${API_URL}/admin/tarjeta/${encoded}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error("Error al cambiar estado de la tarjeta");
    return await response.json();
};

/**
 * POST /admin/tarjeta/vincular-cuenta
 * Vincula una cuenta a una tarjeta.
 * @param {{ numero_tarjeta: string, numero_cuenta: string, es_principal?: 0|1 }} datos
 */
export const vincularCuentaTarjeta = async (datos) => {
    const response = await fetch(`${API_URL}/admin/tarjeta/vincular-cuenta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error("Error al vincular cuenta a la tarjeta");
    return await response.json();
};

/**
 * DELETE /admin/tarjeta/desvincular-cuenta
 * Desvincula una cuenta de una tarjeta.
 * @param {{ numero_tarjeta: string, numero_cuenta: string }} datos
 */
export const desvincularCuentaTarjeta = async (datos) => {
    const response = await fetch(`${API_URL}/admin/tarjeta/desvincular-cuenta`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error("Error al desvincular cuenta de la tarjeta");
    return await response.json();
};

/**
 * PUT /admin/tarjeta/cuenta-principal
 * Cambia la cuenta principal de una tarjeta.
 * @param {{ numero_tarjeta: string, numero_cuenta: string }} datos
 */
export const cambiarCuentaPrincipal = async (datos) => {
    const response = await fetch(`${API_URL}/admin/tarjeta/cuenta-principal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error("Error al cambiar cuenta principal de la tarjeta");
    return await response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACCIONES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/transacciones
 * Lista todas las transacciones con paginación opcional.
 * @param {{ limit?: number, offset?: number }} opciones
 */
export const listarTransacciones = async ({ limit = 50, offset = 0 } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    const response = await fetch(`${API_URL}/admin/transacciones?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al listar transacciones");
    return await response.json();
};

/**
 * GET /admin/transacciones/usuario/:usuario_id
 * Transacciones de un usuario con filtro opcional por tipo.
 * @param {number|string} usuario_id
 * @param {"Deposito"|"Retiro"|"Transferencia"|null} tipo
 */
export const getTransaccionesPorUsuario = async (usuario_id, tipo = null) => {
    const params = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
    const response = await fetch(`${API_URL}/admin/transacciones/usuario/${usuario_id}${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener transacciones del usuario");
    return await response.json();
};

/**
 * GET /admin/transaccion/:transaccion_id
 * Detalle de una transacción específica.
 * @param {number|string} transaccion_id
 */
export const obtenerTransaccion = async (transaccion_id) => {
    const response = await fetch(`${API_URL}/admin/transaccion/${transaccion_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener la transacción");
    return await response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// MONEDAS Y TASAS DE CAMBIO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/monedas
 * Lista todas las monedas registradas.
 */
export const listarMonedas = async () => {
    const response = await fetch(`${API_URL}/admin/monedas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al listar monedas");
    return await response.json();
};

/**
 * PUT /admin/moneda/:moneda_id/estado
 * Activa o desactiva una moneda.
 * @param {number|string} moneda_id
 * @param {boolean} activa
 */
export const cambiarEstadoMoneda = async (moneda_id, activa) => {
    const response = await fetch(`${API_URL}/admin/moneda/${moneda_id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa }),
    });
    if (!response.ok) throw new Error("Error al cambiar estado de la moneda");
    return await response.json();
};

/**
 * GET /admin/tasas-cambio
 * Lista todas las tasas de cambio en caché.
 */
export const listarTasasCambio = async () => {
    const response = await fetch(`${API_URL}/admin/tasas-cambio`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al listar tasas de cambio");
    return await response.json();
};

/**
 * PUT /admin/tasa-cambio
 * Actualiza o inserta una tasa de cambio en caché.
 * @param {{ moneda_origen: string, moneda_destino: string, tasa: number, tipo_tasa: "oficial"|"binance"|"manual" }} datos
 */
export const actualizarTasaCambio = async (datos) => {
    const response = await fetch(`${API_URL}/admin/tasa-cambio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error("Error al actualizar la tasa de cambio");
    return await response.json();
};