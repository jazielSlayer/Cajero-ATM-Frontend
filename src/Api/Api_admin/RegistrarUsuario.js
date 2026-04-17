import { API_URL } from "../Api";

export const solicitarVerificacionRequest = async (correo) => {
    const response = await fetch(`${API_URL}/usuario/solicitar-verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al enviar el código de verificación");
    }

    return data;
};

export const confirmarCodigoRequest = async (correo, codigo) => {
    const response = await fetch(`${API_URL}/usuario/confirmar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Código incorrecto o expirado");
    }

    return data;
};

export const crearUsuarioRequest = async ({
    nombre, apellido, direccion, telefono, edad,
    correo, contrasena, tipo_cuenta, tipo_tarjeta,
}) => {
    const response = await fetch(`${API_URL}/crear/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre, apellido, direccion, telefono, edad,
            correo, contrasena, tipo_cuenta, tipo_tarjeta,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al registrar el usuario");
    }

    return data;
};