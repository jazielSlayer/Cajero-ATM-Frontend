import { API_URL } from "../Api";

export const iniciarRetiro = async (datos) => {
    const response = await fetch(`${API_URL}/retiro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            numero_tarjeta: datos.numero_tarjeta,
            pin:            datos.pin,
            monto:          datos.monto,
            moneda:         datos.moneda         ?? "BOB",
            tipo_tasa:      datos.tipo_tasa       ?? "oficial",
            metodo:         datos.metodo          ?? "ATM",
            // NO incluimos moneda_salida → el backend devuelve las opciones
        }),
    });
 
    const data = await response.json();
 
    // 202 = backend pide que se elija moneda_salida → no es un error
    if (!response.ok && response.status !== 202) {
        throw new Error(data.error || "Error al iniciar retiro.");
    }
 
    return data;
    /*
     * Respuesta 202:
     * {
     *   requiere_seleccion_moneda: true,
     *   mensaje: string,
     *   saldo_solicitado: "100 BOB",
     *   opciones_disponibles: [
     *     { moneda, nombre, simbolo, saldo_disponible, monto_a_recibir, suficiente, tasa_aplicada }
     *   ],
     *   instruccion: string
     * }
     */
};
 
/**
 * PASO 2 — Retiro con moneda de salida ya elegida.
 * Si el backend responde 202 con requiere_confirmacion = true,
 * hay que volver a llamar con confirmar_conversion = true.
 *
 * @param {{ numero_tarjeta, pin, monto, moneda?, moneda_salida, tipo_tasa?, metodo?, confirmar_conversion? }} datos
 */
export const ejecutarRetiro = async (datos) => {
    const response = await fetch(`${API_URL}/retiro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            numero_tarjeta:      datos.numero_tarjeta,
            pin:                 datos.pin,
            monto:               datos.monto,
            moneda:              datos.moneda              ?? "BOB",
            moneda_salida:       datos.moneda_salida,
            tipo_tasa:           datos.tipo_tasa            ?? "oficial",
            metodo:              datos.metodo               ?? "ATM",
            confirmar_conversion: datos.confirmar_conversion ?? false,
        }),
    });
 
    const data = await response.json();
 
    // 202 = requiere confirmación de conversión desde BOB → no es un error
    if (!response.ok && response.status !== 202) {
        throw new Error(data.error || "Error al realizar retiro.");
    }
 
    return { ...data, _status: response.status };
    /*
     * Respuesta 200 (éxito):
     * {
     *   transaccionId, mensaje, conversion: bool,
     *   detalle: { montoSolicitado, montoRetirado, equivalenteBOB, tasa }
     * }
     *
     * Respuesta 202 (necesita confirmar conversión desde BOB):
     * {
     *   requiere_confirmacion: true,
     *   mensaje: string,
     *   detalle_conversion: { montoSolicitado, montoASalida, bobNecesarios, saldoBOBDisponible, tasa },
     *   instruccion: string
     * }
     */
};

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