import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        try {
            /**guarda los datos del usuario en el storage */
            const guardado = sessionStorage.getItem("usuario_atm");
            return guardado ? JSON.parse(guardado) : null;
        } catch {
            return null;
        }
    });

    const guardarSesion = (datos) => {
        sessionStorage.setItem("usuario_atm", JSON.stringify(datos));
        setUsuario(datos);
    };

    const cerrarSesion = () => {
        sessionStorage.removeItem("usuario_atm");
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, guardarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook para consumir el contexto fácilmente */
export const useAuth = () => useContext(AuthContext);