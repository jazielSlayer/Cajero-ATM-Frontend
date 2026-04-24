import { API_URL } from "../Api";

/**
 * Obtiene los datos principales del usuario (cuenta, tarjeta, últimas transacciones).
 */
export const getDatosUsuario = async (nombre_completo) => {
    const response = await fetch(`${API_URL}/usuario/datos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_completo }),
    });
    if (!response.ok) throw new Error("Error al obtener datos del usuario");
    return await response.json();
};

/**
 * Obtiene los saldos multi-moneda del usuario.
 * Usa el endpoint GET /usuario/saldo/:nombre_completo
 */
export const getSaldosUsuario = async (nombre_completo) => {
    const encoded  = encodeURIComponent(nombre_completo);
    const response = await fetch(`${API_URL}/usuario/saldo/${encoded}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener saldos del usuario");
    return await response.json();
};

/**
 * Obtiene las tasas de cambio actuales desde DolarApi (Bolivia).
 * Devuelve un objeto con las monedas disponibles.
 *
 * Endpoint público: https://dolarapi.com/v1/cotizaciones
 * Documentación:    https://dolarapi.com
 *
 * Si falla (CORS / red), devuelve un objeto vacío para no romper la UI.
 */
export const getTasasCambio = async () => {
    try {
        // DolarApi — Bolivia
        const res = await fetch("https://bo.dolarapi.com/v1/cotizaciones", {
            method: "GET",
        });
        if (!res.ok) throw new Error("DolarApi no disponible");
        const data = await res.json();
        // Devuelve array de { moneda, nombre, compra, venta, fechaActualizacion }
        return Array.isArray(data) ? data : [];
    } catch {
        // Si DolarApi no está disponible, intentar con la API genérica de USD
        try {
            const res2 = await fetch("https://dolarapi.com/v1/dolares/oficial");
            if (!res2.ok) throw new Error();
            const usd = await res2.json();
            // Devolver en el mismo formato que usamos en la UI
            return [
                {
                    moneda:            "USD",
                    nombre:            "Dólar oficial",
                    compra:            usd.compra,
                    venta:             usd.venta,
                    fechaActualizacion: usd.fechaActualizacion,
                },
            ];
        } catch {
            return [];
        }
    }
};