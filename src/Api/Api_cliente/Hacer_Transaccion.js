import { API_URL } from "../Api";

export const realizarDeposito = async (datos) => {
    const response = await fetch(`${API_URL}/deposito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            correo:         datos.correo,
            numero_tarjeta: datos.numero_tarjeta,
            contrasena:     datos.contrasena,
            pin:            datos.pin,
            monto:          datos.monto,
            moneda_origen:  datos.moneda_origen  ?? "BOB",
            moneda_destino: datos.moneda_destino ?? "BOB",
            tipo_tasa:      datos.tipo_tasa      ?? "oficial",
            metodo:         datos.metodo         ?? "ATM",
        }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
        throw new Error(data.error || "Error al realizar el depósito.");
    }
 
    return data;
    /*
     * Respuesta exitosa (200):
     * {
     *   transaccionId: number,
     *   mensaje: string,
     *   detalle: {
     *     montoRecibido:   "100 USD",
     *     montoAcreditado: "690.00 BOB",
     *     tipo?:           "deposito_directo",        // solo si misma moneda
     *     equivalenteBOB?: "690.00 BOB",              // solo si hay conversión
     *     tasa?: {                                     // solo si hay conversión
     *       tipo, origen_a_BOB, destino_a_BOB, moneda_origen, moneda_destino
     *     }
     *   }
     * }
     */
};
 
/**
 * Consulta las tasas de cambio actuales guardadas en base de datos
 * No requiere autenticación
 *
 * @returns {Promise<{ tasas: Array<{Moneda_origen, Moneda_destino, Tasa, Tipo_tasa, Fecha_actualizacion}> }>}
 */
export const consultarTasas = async () => {
    const response = await fetch(`${API_URL}/tasas`);
    const data = await response.json();
 
    if (!response.ok) {
        throw new Error(data.error || "Error al obtener tasas de cambio.");
    }
 
    return data;
};
 
/**
 * Consulta los saldos disponibles de una cuenta
 *
 * @param {string} numeroCuenta
 * @returns {Promise<{ numero_cuenta: string, saldos: Array }>}
 */
export const consultarSaldos = async (numeroCuenta) => {
    const response = await fetch(`${API_URL}/transacciones/saldos/${numeroCuenta}`);
    const data = await response.json();
 
    if (!response.ok) {
        throw new Error(data.error || "Error al consultar saldos.");
    }
 
    return data;
};