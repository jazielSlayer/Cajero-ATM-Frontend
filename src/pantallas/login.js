import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../Api/Api_admin/Login";
import { useAuth } from "../Authcontext";
import "../Css/Login.css";

const RUTA_POR_ROL = {
    Cliente:       "/cliente/",
    Administrador: "/admin/",
    Operador:      "/operador/",
};

function LoginPantalla() {
    const navigate          = useNavigate();
    const { guardarSesion } = useAuth();

    const [form, setForm]         = useState({ correo: "", contrasena: "" }); // ← sin numero_tarjeta ni pin
    const [error, setError]       = useState("");
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
            const datos = await loginRequest(form.correo, form.contrasena); // ← solo dos args

            guardarSesion(datos);

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
                            type="email"                  // ← type email para validación nativa
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                        <label>Correo electrónico</label>
                    </div>

                    <div className="username">
                        <input
                            type="password"
                            name="contrasena"
                            value={form.contrasena}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
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