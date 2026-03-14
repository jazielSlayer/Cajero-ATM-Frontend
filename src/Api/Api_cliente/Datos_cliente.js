import { API_URL } from "../Api";

// api.js
export const getDatosUsuario = async (nombre_completo) => {
    const response = await fetch(`${API_URL}/usuario/datos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_completo })
    });

    if (!response.ok) throw new Error("Error al obtener datos del usuario");
    return await response.json();
};