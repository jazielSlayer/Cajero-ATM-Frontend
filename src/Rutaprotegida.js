import { Navigate } from "react-router-dom";
import { useAuth } from "./Authcontext";

/**
 * 
 *
 * @param {React.ReactNode} children  
 * @param {string[]}        roles     
 *                                      
 */
function RutaProtegida({ children, roles = [] }) {
    const { usuario } = useAuth();

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (roles.length > 0 && !roles.includes(usuario.Nombre_rol)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RutaProtegida;