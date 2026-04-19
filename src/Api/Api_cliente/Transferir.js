import { API_URL } from "../Api";

/**
 * Consulta los saldos disponibles de una cuenta
 * @param {string} numeroCuenta
 */
export const consultarSaldos = async (numeroCuenta) => {
    const response = await fetch(`${API_URL}/saldos/${numeroCuenta}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al consultar saldos.");
    }

    return data;
};

/**
 * Consulta las tasas de cambio actuales
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
 * Realiza una transferencia entre cuentas.
 *
 * PASO 1 — Sin conversión (misma moneda):
 * @param {{
 *   numero_de_cuenta: string,
 *   numero_cuenta_destino: string,
 *   monto: number,
 *   metodo?: "ATM"|"web"|"app_movil",
 *   descripcion?: string,
 *   moneda_origen?: string,
 *   moneda_destino?: string,
 *   tipo_tasa?: "oficial"|"binance",
 *   confirmar_conversion?: boolean
 * }} datos
 *
 * Respuesta 200 (éxito):
 * { transaccionId, mensaje, detalle: { montoDebitado, montoAcreditado, equivalenteBOB, tasa } }
 *
 * Respuesta 202 (requiere confirmación de conversión desde BOB):
 * {
 *   requiere_confirmacion: true,
 *   mensaje: string,
 *   detalle_conversion: { montoSolicitado, montoBOBNecesario, saldoBOBDisponible, montoAcreditaDestino, tasa },
 *   instruccion: string
 * }
 *
 * Respuesta 400 con requiere_conversion (saldo insuficiente):
 * {
 *   error: string,
 *   requiere_conversion: true,
 *   detalle_conversion: { ... }
 * }
 */
export const realizarTransferencia = async (datos) => {
    const response = await fetch(`${API_URL}/transferencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            numero_de_cuenta:      datos.numero_de_cuenta,
            numero_cuenta_destino: datos.numero_cuenta_destino,
            monto:                 datos.monto,
            metodo:                datos.metodo               ?? "ATM",
            descripcion:           datos.descripcion          ?? null,
            moneda_origen:         datos.moneda_origen        ?? "BOB",
            moneda_destino:        datos.moneda_destino       ?? "BOB",
            tipo_tasa:             datos.tipo_tasa             ?? "oficial",
            confirmar_conversion:  datos.confirmar_conversion  ?? false,
        }),
    });

    const data = await response.json();

    // 202 = requiere confirmación de conversión → no es error
    if (!response.ok && response.status !== 202) {
        throw new Error(data.error || "Error al realizar la transferencia.");
    }

    return { ...data, _status: response.status };
};