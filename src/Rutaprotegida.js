import { Navigate } from "react-router-dom";
import { useAuth } from "./Authcontext";

/**
 * Componente que protege rutas según autenticación y rol.
 *
 * @param {React.ReactNode} children  - Componente a renderizar si pasa la validación
 * @param {string[]}        roles     - Roles permitidos, e.g. ["Cliente"], ["Administrador"], ["Operador"]
 *                                      Si está vacío/undefined, solo requiere estar autenticado.
 */
function RutaProtegida({ children, roles = [] }) {
    const { usuario } = useAuth();

    // No autenticado → al login
    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    // Rol no permitido → al login (podrías redirigir a /403 si lo prefieres)
    if (roles.length > 0 && !roles.includes(usuario.Nombre_rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RutaProtegida;