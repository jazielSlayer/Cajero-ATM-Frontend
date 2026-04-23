import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Registrar.css";
import { useTranslation } from "react-i18next";
import {
    IconUserPlus, IconMailCheck, IconCreditCard,
    IconShieldCheck, IconCreditCardFilled, IconBuildingBank,
} from "@tabler/icons-react";
import {
    solicitarVerificacionRequest,
    confirmarCodigoRequest,
    crearUsuarioRequest,
} from "../Api/Api_admin/RegistrarUsuario";

const IDIOMAS = [
    { code: "es", label: "ES", nombre: "Español" },
    { code: "en", label: "EN", nombre: "English" },
    { code: "pt", label: "PT", nombre: "Português" },
    { code: "fr", label: "FR", nombre: "Français" },
    { code: "de", label: "DE", nombre: "Deutsch" },
];

function ResumenFila({ label, valor }) {
    return (
        <div className="reg-resumen-fila">
            <span className="reg-resumen-label">{label}</span>
            <span className="reg-resumen-valor">{valor}</span>
        </div>
    );
}

export default function Registrar() {
    const navigate      = useNavigate();
    const { t, i18n }   = useTranslation();

    const PASOS = [
        t("reg.paso_correo"),
        t("reg.paso_verificar"),
        t("reg.paso_datos"),
        t("reg.paso_cuenta"),
        t("reg.paso_confirmar"),
    ];

    const TIPO_CUENTA = [
        { id: "ahorro",    label: t("reg.cuenta_ahorro"),    desc: t("reg.cuenta_ahorro_desc"),    icon: <IconBuildingBank size={26} /> },
        { id: "corriente", label: t("reg.cuenta_corriente"), desc: t("reg.cuenta_corriente_desc"), icon: <IconCreditCardFilled size={26} /> },
    ];

    const TIPO_TARJETA = [
        { id: "debito",  label: t("reg.tarjeta_debito"),  desc: t("reg.tarjeta_debito_desc"),  icon: <IconCreditCard size={26} /> },
        { id: "credito", label: t("reg.tarjeta_credito"), desc: t("reg.tarjeta_credito_desc"), icon: <IconShieldCheck size={26} /> },
    ];

    const [paso, setPaso]       = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
    const [registroExitoso, setRegistroExitoso] = useState(false);

    const [correo, setCorreo]   = useState("");
    const [enviando, setEnviando] = useState(false);
    const [codioEnviado, setCodioEnviado] = useState(false);
    const [codigo, setCodigo]   = useState("");

    const [nombre, setNombre]   = useState("");
    const [apellido, setApellido] = useState("");
    const [direccion, setDir]   = useState("");
    const [telefono, setTel]    = useState("");
    const [edad, setEdad]       = useState("");
    const [contrasena, setContra] = useState("");

    const [tipoCuenta, setTipoCuenta]   = useState("ahorro");
    const [tipoTarjeta, setTipoTarjeta] = useState("debito");

    const cambiarIdioma = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("atm_idioma", code);
    };

    const limpiarError = () => setError("");

    const solicitarCodigo = async () => {
        setEnviando(true);
        try {
            await solicitarVerificacionRequest(correo);
            setCodioEnviado(true);
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    const confirmarCodigo = async () => {
        setLoading(true);
        try {
            await confirmarCodigoRequest(correo, codigo);
            setPaso(2);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            await crearUsuarioRequest({
                nombre, apellido, direccion, telefono,
                edad: Number(edad), correo, contrasena,
                tipo_cuenta: tipoCuenta,
                tipo_tarjeta: tipoTarjeta,
            });
            setRegistroExitoso(true);
            setPaso(5);
        } catch (e) {
            setError(e.message || t("reg.error_crear"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (registroExitoso) {
            const timer = setTimeout(() => navigate("/"), 3000);
            return () => clearTimeout(timer);
        }
    }, [registroExitoso, navigate]);

    return (
        <div className="reg-container">

             <div className="reg-topbar">
                <div className="reg-globe-icon">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        <path d="M2 12h20"/>
                    </svg>
                </div>
                <div className="lang-selector">
                    {IDIOMAS.map((idioma) => (
                        <button
                            key={idioma.code}
                            className={`lang-btn ${i18n.language === idioma.code ? "lang-btn--active" : ""}`}
                            onClick={() => cambiarIdioma(idioma.code)}
                            title={idioma.nombre}
                        >
                            {idioma.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stepper */}
            {paso < 5 && (
                <div className="reg-stepper">
                    {PASOS.map((s, i) => (
                        <div
                            key={s}
                            className={`reg-step ${i <= paso ? "reg-step--active" : ""} ${i < paso ? "reg-step--done" : ""}`}
                        >
                            <div className="reg-step-circle">{i < paso ? "✓" : i + 1}</div>
                            <span className="reg-step-label">{s}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── ÉXITO ── */}
            {registroExitoso && (
                <div className="reg-card reg-card--success reg-fade">
                    <h2 className="reg-card-title" style={{ display: "flex", alignItems: "center", gap: ".5rem", justifyContent: "center" }}>
                        <IconUserPlus size={32} /> {t("reg.exito_titulo")}
                    </h2>
                    <p className="reg-success-msg">
                        {t("reg.exito_msg")}<br /><br />
                        {t("reg.exito_correo_aviso")}<br />
                        <strong style={{ color: "var(--reg-primary)" }}>{correo}</strong>
                    </p>
                    <p className="reg-datos-aviso" style={{ marginTop: "1.5rem" }}>
                        {t("reg.exito_redireccion")}
                    </p>
                    <div style={{ textAlign: "center", marginTop: "2rem", opacity: 0.7 }}>
                        <div className="reg-btn-next" style={{ display: "inline-block", padding: "0.7rem 2rem" }} onClick={() => navigate("/")}>
                            {t("reg.ir_login")}
                        </div>
                    </div>
                </div>
            )}

            {/* ── PASO 0: Correo ── */}
            {paso === 0 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">{t("reg.p0_titulo")}</h2>
                    <p className="reg-card-sub">{t("reg.p0_sub")}</p>
                    <div className="reg-field" style={{ marginBottom: "1.25rem" }}>
                        <label className="reg-label">{t("reg.correo_label")}</label>
                        <input
                            className="reg-input"
                            type="email"
                            placeholder="tucorreo@gmail.com"
                            value={correo}
                            onChange={(e) => { setCorreo(e.target.value); limpiarError(); }}
                        />
                    </div>
                    {error && <div className="reg-error">{error}</div>}
                    {!codioEnviado ? (
                        <button className="reg-btn-next" style={{ width: "100%" }} onClick={solicitarCodigo} disabled={!correo || enviando}>
                            {enviando ? t("reg.enviando") : t("reg.enviar_codigo")}
                        </button>
                    ) : (
                        <>
                            <div className="reg-correo-badge">
                                <IconMailCheck size={18} />
                                {t("reg.codigo_enviado_a")} <strong>{correo}</strong>
                            </div>
                            <button className="reg-btn-next" style={{ width: "100%" }} onClick={() => { limpiarError(); setPaso(1); }}>
                                {t("reg.tengo_codigo")}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ── PASO 1: Verificar ── */}
            {paso === 1 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">{t("reg.p1_titulo")}</h2>
                    <p className="reg-card-sub">{t("reg.p1_sub")}</p>
                    <div className="reg-correo-badge">
                        <IconMailCheck size={18} />
                        {t("reg.codigo_enviado_a")} <strong>{correo}</strong>
                    </div>
                    <div className="reg-field" style={{ marginBottom: "1.5rem" }}>
                        <label className="reg-label">{t("reg.codigo_label")}</label>
                        <input
                            className="reg-input reg-input--codigo"
                            type="text"
                            maxLength={6}
                            placeholder="· · · · · ·"
                            value={codigo}
                            onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, "")); limpiarError(); }}
                        />
                    </div>
                    {error && <div className="reg-error">{error}</div>}
                    <div className="reg-btn-row">
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(0); }}>← {t("reg.atras")}</button>
                        <button className="reg-btn-next" onClick={confirmarCodigo} disabled={codigo.length < 6 || loading}>
                            {loading ? t("reg.verificando") : t("reg.verificar")}
                        </button>
                    </div>
                    <p style={{ textAlign: "center", marginTop: "1rem", fontSize: ".82rem", color: "var(--reg-muted)" }}>
                        {t("reg.no_recibiste")}{" "}
                        <span style={{ color: "var(--reg-primary)", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => { limpiarError(); setPaso(0); setCodioEnviado(false); setCodigo(""); }}>
                            {t("reg.reenviar")}
                        </span>
                    </p>
                </div>
            )}

            {/* ── PASO 2: Datos personales ── */}
            {paso === 2 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">{t("reg.p2_titulo")}</h2>
                    <p className="reg-card-sub">{t("reg.p2_sub")}</p>
                    <div className="reg-form-grid">
                        <div className="reg-field">
                            <label className="reg-label">{t("reg.nombre")}</label>
                            <input className="reg-input" type="text" placeholder="María Elena" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">{t("reg.apellido")}</label>
                            <input className="reg-input" type="text" placeholder="Quispe Flores" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">{t("reg.telefono")}</label>
                            <input className="reg-input" type="tel" placeholder="71234567" value={telefono} onChange={(e) => setTel(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">{t("reg.edad")}</label>
                            <input className="reg-input" type="number" min="18" placeholder="25" value={edad} onChange={(e) => setEdad(e.target.value)} />
                        </div>
                    </div>
                    <div className="reg-form-grid reg-form-grid--full">
                        <div className="reg-field">
                            <label className="reg-label">{t("reg.direccion")}</label>
                            <input className="reg-input" type="text" placeholder="Av. Hernando Siles 890" value={direccion} onChange={(e) => setDir(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">{t("reg.contrasena")}</label>
                            <input className="reg-input" type="password" placeholder={t("reg.contrasena_placeholder")} value={contrasena} onChange={(e) => setContra(e.target.value)} />
                        </div>
                    </div>
                    <div className="reg-btn-row">
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(1); }}>← {t("reg.atras")}</button>
                        <button className="reg-btn-next" onClick={() => { limpiarError(); setPaso(3); }}
                            disabled={!nombre || !apellido || !telefono || !edad || !direccion || !contrasena}>
                            {t("reg.continuar")}
                        </button>
                    </div>
                </div>
            )}

            {/* ── PASO 3: Tipo cuenta y tarjeta ── */}
            {paso === 3 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">{t("reg.p3_titulo")}</h2>
                    <p className="reg-card-sub">{t("reg.p3_sub")}</p>
                    <label className="reg-label" style={{ marginBottom: ".75rem", display: "block" }}>{t("reg.tipo_cuenta_label")}</label>
                    <div className="reg-tipo-grid" style={{ marginBottom: "1.75rem" }}>
                        {TIPO_CUENTA.map((tc) => (
                            <button key={tc.id} className={`reg-tipo-btn ${tipoCuenta === tc.id ? "reg-tipo-btn--sel" : ""}`} onClick={() => setTipoCuenta(tc.id)}>
                                <span className="reg-tipo-icon">{tc.icon}</span>
                                <span className="reg-tipo-label">{tc.label}</span>
                                <span className="reg-tipo-desc">{tc.desc}</span>
                            </button>
                        ))}
                    </div>
                    <label className="reg-label" style={{ marginBottom: ".75rem", display: "block" }}>{t("reg.tipo_tarjeta_label")}</label>
                    <div className="reg-tipo-grid">
                        {TIPO_TARJETA.map((tt) => (
                            <button key={tt.id} className={`reg-tipo-btn ${tipoTarjeta === tt.id ? "reg-tipo-btn--sel" : ""}`} onClick={() => setTipoTarjeta(tt.id)}>
                                <span className="reg-tipo-icon">{tt.icon}</span>
                                <span className="reg-tipo-label">{tt.label}</span>
                                <span className="reg-tipo-desc">{tt.desc}</span>
                            </button>
                        ))}
                    </div>
                    <div className="reg-btn-row" style={{ marginTop: "1.5rem" }}>
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(2); }}>← {t("reg.atras")}</button>
                        <button className="reg-btn-next" onClick={() => { limpiarError(); setPaso(4); }}>{t("reg.continuar")}</button>
                    </div>
                </div>
            )}

            {/* ── PASO 4: Confirmar ── */}
            {paso === 4 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">{t("reg.p4_titulo")}</h2>
                    <p className="reg-card-sub">{t("reg.p4_sub")}</p>
                    <div className="reg-resumen">
                        <ResumenFila label={t("reg.correo_label")}      valor={correo} />
                        <ResumenFila label={t("reg.nombre")}            valor={`${nombre} ${apellido}`} />
                        <ResumenFila label={t("reg.telefono")}          valor={telefono} />
                        <ResumenFila label={t("reg.edad")}              valor={`${edad} ${t("reg.anios")}`} />
                        <ResumenFila label={t("reg.direccion")}         valor={direccion} />
                        <ResumenFila label={t("reg.tipo_cuenta_label")} valor={tipoCuenta.charAt(0).toUpperCase() + tipoCuenta.slice(1)} />
                        <ResumenFila label={t("reg.tipo_tarjeta_label")}valor={tipoTarjeta.charAt(0).toUpperCase() + tipoTarjeta.slice(1)} />
                    </div>
                    {error && <div className="reg-error">{error}</div>}
                    <div className="reg-btn-row">
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(3); }}>← {t("reg.atras")}</button>
                        <button className="reg-btn-confirm" onClick={handleSubmit} disabled={loading}>
                            {loading ? t("reg.registrando") : t("reg.crear_cuenta")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}