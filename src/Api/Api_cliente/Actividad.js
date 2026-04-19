import { API_URL } from "../Api";

/**
 * Obtiene la actividad completa del usuario con filtros opcionales.
 *
 * @param {string} nombre_completo - Nombre completo del usuario (desde sessionStorage)
 * @param {Object} filtros         - Filtros opcionales
 * @param {string} filtros.fecha_desde       - "YYYY-MM-DD"
 * @param {string} filtros.fecha_hasta       - "YYYY-MM-DD"
 * @param {string} filtros.tipo_transaccion  - "Deposito" | "Retiro" | "Transferencia" | "Todos"
 * @param {string} filtros.palabra_clave     - Texto libre
 * @param {string} filtros.numero_cuenta     - Número de cuenta para filtrar
 * @returns {Promise<Object>}
 */
export const getActividadCompleta = async (nombre_completo, filtros = {}) => {
    const response = await fetch(`${API_URL}/actividad/completa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_completo, ...filtros }),
    });
    if (!response.ok) throw new Error("Error al obtener actividad del usuario");
    return await response.json();
};

/**
 * Solicita los datos de exportación en CSV desde el backend.
 * El CSV se genera en el frontend (descarga).
 *
 * @param {string} nombre_completo
 * @param {Object} filtros
 * @returns {Promise<{ csv: string, total: number }>}
 */
export const exportarActividadCSV = async (nombre_completo, filtros = {}) => {
    const response = await fetch(`${API_URL}/actividad/exportar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_completo, ...filtros }),
    });
    if (!response.ok) throw new Error("Error al exportar transacciones");
    return await response.json();
}; 