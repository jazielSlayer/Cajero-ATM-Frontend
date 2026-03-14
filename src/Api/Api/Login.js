import { API_URL } from "../Api";

export const loginRequest = async (numero_tarjeta, pin, contrasena) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero_tarjeta, pin, contrasena }),
    });
 
    const data = await response.json();
 
    if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
    }
 
    return data; 
};