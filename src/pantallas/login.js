import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../Api/Api_admin/Login";
import { useAuth } from "../Authcontext";
import "../Css/Login.css";
import { useTranslation } from "react-i18next";

const RUTA_POR_ROL = {
    Cliente:       "/cliente/",
    Administrador: "/admin/",
    Operador:      "/operador/",
};



function LoginPantalla() {
    const navigate          = useNavigate();
    const { guardarSesion } = useAuth();
    const { t, i18n }       = useTranslation();

    const [form, setForm]         = useState({ correo: "", contrasena: "" });
    const [error, setError]       = useState("");
    const [cargando, setCargando] = useState(false);

    const IDIOMAS = [
        { code: "es", label: "ES", nombre: "Español",    flag: "🇪🇸" },
        { code: "en", label: "EN", nombre: "English",    flag: "🇬🇧" },
        { code: "pt", label: "PT", nombre: "Português",  flag: "🇧🇷" },
        { code: "fr", label: "FR", nombre: "Français",   flag: "🇫🇷" },
        { code: "de", label: "DE", nombre: "Deutsch",    flag: "🇩🇪" },
    ];

    const cambiarIdioma = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("atm_idioma", code);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError("");
        try {
            const datos = await loginRequest(form.correo, form.contrasena);
            guardarSesion(datos);
            const ruta = RUTA_POR_ROL[datos.Nombre_rol] ?? "/";
            navigate(ruta, { replace: true });
        } catch (err) {
            setError(err.message || t("login.error_credenciales"));
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="Page">

            

            <div className="formulario">
                 <div className="login-header">
                    <h1 className="TituloLogin">{t("login.titulo")}</h1>
                    <div className="lang-selector">
                        {IDIOMAS.map((idioma) => (
                            <button
                                key={idioma.code}
                                className={`lang-btn ${i18n.language === idioma.code ? "lang-btn--active" : ""}`}
                                onClick={() => cambiarIdioma(idioma.code)}
                                
                            >
                                <span className="lang-flag">{idioma.flag}</span>
                                
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="username">
                        <input
                            type="email"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                        <label>{t("login.correo")}</label>
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
                        <label>{t("login.contrasena")}</label>
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <input
                        type="submit"
                        value={cargando ? t("login.verificando") : t("login.iniciar")}
                        disabled={cargando}
                    />
                    <div className="registrarse">
                        {t("login.quiero")}{" "}
                        <Link to="/registrar" className="a">{t("login.registrarme")}</Link>
                    </div>
                    
                </form>
            </div>
            
        </div>
    );
}

export default LoginPantalla;