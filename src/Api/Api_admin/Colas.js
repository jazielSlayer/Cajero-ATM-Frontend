import { API_URL } from "../Api";

// ─────────────────────────────────────────────────────────────────────────────
// TEORÍA DE COLAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /analisis/colas
 * Análisis completo con datos reales de la BD.
 * Calcula λ desde la tabla Transacciones y μ desde el middleware.
 *
 * Devuelve:
 *  - parametros:             { lambda_promedio_hora, lambda_pico_hora, hora_pico, mu_tx_por_hora, tiempo_servicio_ms, total_tx_24h, fuente_mu }
 *  - modelos:                { MM1, MM2, MM3, MM1_pico }
 *  - distribucion_por_hora:  [{ hora, cantidad }]
 *  - lambda_por_tipo:        [{ tipo, total_24h, lambda_hora }]
 */
export const getAnalisisColas = async () => {
    const response = await fetch(`${API_URL}/analisis/colas`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener el análisis de colas");
    return await response.json();
};

/**
 * POST /analisis/colas/calcular
 * Cálculo manual con λ, μ y s propios (para demos del proyecto).
 *
 * @param {Object} params
 * @param {number}  params.lambda       - Tasa de llegada (tx/hora)
 * @param {number}  params.mu           - Tasa de servicio (tx/hora)
 * @param {number}  [params.s=1]        - Número de servidores (workers)
 * @param {boolean} [params.calcular_pn=false] - Si true, calcula también P(n)
 * @param {number}  [params.n=0]        - Valor de n para P(n), solo si calcular_pn=true
 *
 * Devuelve los resultados del modelo M/M/1 o M/M/s según el valor de s,
 * más Pn_calculado si se solicitó.
 */
export const calcularColasManual = async ({ lambda, mu, s = 1, calcular_pn = false, n = 0 }) => {
    const response = await fetch(`${API_URL}/analisis/colas/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lambda, mu, s, calcular_pn, n }),
    });
    if (!response.ok) throw new Error("Error al calcular la teoría de colas manualmente");
    return await response.json();
};

/**
 * GET /analisis/colas/pn/:n
 * Probabilidad de que haya exactamente n clientes en el sistema.
 * Usa parámetros reales de la BD si no se pasan query params.
 *
 * @param {number} n               - Número exacto de clientes en el sistema (≥ 0)
 * @param {Object} [opciones]
 * @param {number} [opciones.lambda] - Tasa de llegada manual (opcional)
 * @param {number} [opciones.mu]     - Tasa de servicio manual (opcional)
 * @param {number} [opciones.s=1]    - Número de servidores (opcional)
 *
 * Ejemplos de uso:
 *   getProbabilidadN(3)                          → usa λ y μ reales de la BD
 *   getProbabilidadN(5, { lambda: 60, mu: 90, s: 2 }) → parámetros manuales
 *
 * Devuelve:
 *  { lambda, mu, s, Pn, Pn_pct, interpretacion, ... }
 */
export const getProbabilidadN = async (n, { lambda, mu, s } = {}) => {
    const params = new URLSearchParams();
    if (lambda !== undefined) params.set("lambda", lambda);
    if (mu     !== undefined) params.set("mu",     mu);
    if (s      !== undefined) params.set("s",      s);

    const query    = params.toString() ? `?${params}` : "";
    const response = await fetch(`${API_URL}/analisis/colas/pn/${n}${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Error al obtener P(${n}) del sistema de colas`);
    return await response.json();
};