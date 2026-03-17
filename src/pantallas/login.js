import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../Api/Api_admin/Login";
import { useAuth } from "../Authcontext";
import "../Css/Login.css";


const RUTA_POR_ROL = {
    Cliente:        "/cliente/",
    Administrador:  "/admin/",
    Operador:       "/operador/",
};

function LoginPantalla() {
    const navigate     = useNavigate();
    const { guardarSesion } = useAuth();

    const [form, setForm]       = useState({ numero_tarjeta: "", pin: "", contrasena: "" });
    const [error, setError]     = useState("");
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError("");

        try {
            const datos = await loginRequest(
                form.numero_tarjeta,
                form.pin,
                form.contrasena
            );

            // Guardar sesión en contexto + sessionStorage
            guardarSesion(datos);

            // Redirigir según rol
            const ruta = RUTA_POR_ROL[datos.Nombre_rol] ?? "/";
            navigate(ruta, { replace: true });

        } catch (err) {
            setError(err.message || "Credenciales incorrectas");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="Page">
            <div className="formulario">
                <h1 className="TituloLogin">Inicio de sesión</h1>

                <form onSubmit={handleSubmit}>
                    <div className="username">
                        <input
                            type="text"
                            name="numero_tarjeta"
                            value={form.numero_tarjeta}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        <label>Número de tarjeta</label>
                    </div>

                    <div className="username">
                        <input
                            type="password"
                            name="pin"
                            value={form.pin}
                            onChange={handleChange}
                            required
                        />
                        <label>PIN</label>
                    </div>

                    <div className="username">
                        <input
                            type="password"
                            name="contrasena"
                            value={form.contrasena}
                            onChange={handleChange}
                            required
                        />
                        <label>Contraseña</label>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <input
                        type="submit"
                        value={cargando ? "Verificando..." : "Iniciar"}
                        disabled={cargando}
                    />
                    <div className="registrarse">
                        Quiero <Link to="/registrar" className="a">Registrarme</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPantalla;