import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Registrar.css";
import {
    IconUserPlus,
    IconMailCheck,
    IconCreditCard,
    IconShieldCheck,
    IconCreditCardFilled,
    IconBuildingBank,
} from "@tabler/icons-react";

import {
    solicitarVerificacionRequest,
    confirmarCodigoRequest,
    crearUsuarioRequest,
} from "../Api/Api_admin/RegistrarUsuario";


const PASOS = ["Correo", "Verificar", "Datos", "Cuenta", "Confirmar"];

const TIPO_CUENTA = [
    { id: "ahorro",    label: "Ahorro",    desc: "Ideal para guardar y ahorrar",    icon: <IconBuildingBank size={26} /> },
    { id: "corriente", label: "Corriente", desc: "Para uso diario y transacciones", icon: <IconCreditCardFilled size={26} /> },
];

const TIPO_TARJETA = [
    { id: "debito",  label: "Débito",  desc: "Gasta solo lo que tienes",         icon: <IconCreditCard size={26} /> },
    { id: "credito", label: "Crédito", desc: "Compra ahora y paga después",      icon: <IconShieldCheck size={26} /> },
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
    const navigate = useNavigate();

    const [paso, setPaso]         = useState(0);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");
    const [registroExitoso, setRegistroExitoso] = useState(false);

    // Paso 0 – correo
    const [correo, setCorreo]     = useState("");
    const [enviando, setEnviando] = useState(false);
    const [codioEnviado, setCodioEnviado] = useState(false);

    // Paso 1 – código
    const [codigo, setCodigo]     = useState("");

    // Paso 2 – datos personales
    const [nombre, setNombre]     = useState("");
    const [apellido, setApellido] = useState("");
    const [direccion, setDir]     = useState("");
    const [telefono, setTel]      = useState("");
    const [edad, setEdad]         = useState("");
    const [contrasena, setContra] = useState("");

    // Paso 3 – tipo cuenta / tarjeta
    const [tipoCuenta, setTipoCuenta]   = useState("ahorro");
    const [tipoTarjeta, setTipoTarjeta] = useState("debito");

    // ── Helpers ────────────────────────────────────────────────────────────
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
                nombre, 
                apellido, 
                direccion, 
                telefono,
                edad: Number(edad), 
                correo, 
                contrasena,
                tipo_cuenta: tipoCuenta,
                tipo_tarjeta: tipoTarjeta,
            });

            // Mostrar pantalla de éxito
            setRegistroExitoso(true);
            setPaso(5);   // Usamos el paso 5 solo para éxito

        } catch (e) {
            setError(e.message || "Ocurrió un error al crear la cuenta");
        } finally {
            setLoading(false);
        }
    };

    // Redirección automática después de 3 segundos en pantalla de éxito
    useEffect(() => {
        if (registroExitoso) {
            const timer = setTimeout(() => {
                navigate("/");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [registroExitoso, navigate]);

    const reiniciar = () => {
        setPaso(0);
        setCorreo(""); 
        setCodigo(""); 
        setNombre(""); 
        setApellido("");
        setDir(""); 
        setTel(""); 
        setEdad(""); 
        setContra(""); 
        setError("");
        setCodioEnviado(false);
        setTipoCuenta("ahorro"); 
        setTipoTarjeta("debito");
        setRegistroExitoso(false);
    };

    return (
        <div className="reg-container">

            {/* Stepper - se oculta en éxito */}
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

            {/* ── PANTALLA DE ÉXITO ── */}
            {registroExitoso && (
                <div className="reg-card reg-card--success reg-fade">
                    <h2 className="reg-card-title" style={{ display: "flex", alignItems: "center", gap: ".5rem", justifyContent: "center" }}>
                        <IconUserPlus size={32} /> ¡Cuenta creada!
                    </h2>
                    
                    <p className="reg-success-msg">
                        Tu cuenta fue registrada exitosamente.<br /><br />
                        Hemos enviado tu <strong>número de tarjeta</strong>, <strong>número de cuenta</strong> y <strong>PIN</strong> al correo:<br />
                        <strong style={{ color: "var(--reg-primary)" }}>{correo}</strong>
                    </p>

                    <p className="reg-datos-aviso" style={{ marginTop: "1.5rem" }}>
                        Revisa tu bandeja de entrada (y spam) para obtener todos los datos de acceso.<br />
                        Serás redirigido automáticamente a la pantalla de inicio de sesión en unos segundos...
                    </p>

                    <div style={{ textAlign: "center", marginTop: "2rem", opacity: 0.7 }}>
                        <div className="reg-btn-next" style={{ display: "inline-block", padding: "0.7rem 2rem" }} onClick={() => navigate("/")}>
                            Ir al Login ahora
                        </div>
                    </div>
                </div>
            )}

            {/* ── PASO 0: Correo ── */}
            {paso === 0 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">Crea tu cuenta</h2>
                    <p className="reg-card-sub">Ingresa tu correo para empezar. Te enviaremos un código de verificación.</p>

                    <div className="reg-field" style={{ marginBottom: "1.25rem" }}>
                        <label className="reg-label">Correo electrónico</label>
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
                        <button
                            className="reg-btn-next"
                            style={{ width: "100%" }}
                            onClick={solicitarCodigo}
                            disabled={!correo || enviando}
                        >
                            {enviando ? "Enviando código…" : "Enviar código de verificación →"}
                        </button>
                    ) : (
                        <>
                            <div className="reg-correo-badge">
                                <IconMailCheck size={18} />
                                Código enviado a <strong>{correo}</strong>
                            </div>
                            <button
                                className="reg-btn-next"
                                style={{ width: "100%" }}
                                onClick={() => { limpiarError(); setPaso(1); }}
                            >
                                Tengo mi código →
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Resto de pasos (1, 2, 3 y 4) se mantienen igual */}
            {/* PASO 1: Verificar código */}
            {paso === 1 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">Verifica tu correo</h2>
                    <p className="reg-card-sub">Ingresa el código de 6 dígitos que enviamos a tu correo.</p>

                    <div className="reg-correo-badge">
                        <IconMailCheck size={18} />
                        Código enviado a <strong>{correo}</strong>
                    </div>

                    <div className="reg-field" style={{ marginBottom: "1.5rem" }}>
                        <label className="reg-label">Código de verificación</label>
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
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(0); }}>← Atrás</button>
                        <button
                            className="reg-btn-next"
                            onClick={confirmarCodigo}
                            disabled={codigo.length < 6 || loading}
                        >
                            {loading ? "Verificando…" : "Verificar →"}
                        </button>
                    </div>

                    <p style={{ textAlign: "center", marginTop: "1rem", fontSize: ".82rem", color: "var(--reg-muted)" }}>
                        ¿No recibiste el código?{" "}
                        <span
                            style={{ color: "var(--reg-primary)", cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => { limpiarError(); setPaso(0); setCodioEnviado(false); setCodigo(""); }}
                        >
                            Reenviar
                        </span>
                    </p>
                </div>
            )}

            {/* PASO 2: Datos personales */}
            {paso === 2 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">Datos personales</h2>
                    <p className="reg-card-sub">Completa tu información para crear la cuenta.</p>

                    <div className="reg-form-grid">
                        <div className="reg-field">
                            <label className="reg-label">Nombre</label>
                            <input className="reg-input" type="text" placeholder="María Elena" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Apellido</label>
                            <input className="reg-input" type="text" placeholder="Quispe Flores" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Teléfono</label>
                            <input className="reg-input" type="tel" placeholder="71234567" value={telefono} onChange={(e) => setTel(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Edad</label>
                            <input className="reg-input" type="number" min="18" placeholder="25" value={edad} onChange={(e) => setEdad(e.target.value)} />
                        </div>
                    </div>

                    <div className="reg-form-grid reg-form-grid--full">
                        <div className="reg-field">
                            <label className="reg-label">Dirección</label>
                            <input className="reg-input" type="text" placeholder="Av. Hernando Siles 890" value={direccion} onChange={(e) => setDir(e.target.value)} />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Contraseña</label>
                            <input className="reg-input" type="password" placeholder="Mínimo 8 caracteres" value={contrasena} onChange={(e) => setContra(e.target.value)} />
                        </div>
                    </div>

                    <div className="reg-btn-row">
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(1); }}>← Atrás</button>
                        <button
                            className="reg-btn-next"
                            onClick={() => { limpiarError(); setPaso(3); }}
                            disabled={!nombre || !apellido || !telefono || !edad || !direccion || !contrasena}
                        >
                            Continuar →
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 3: Tipo cuenta y tarjeta */}
            {paso === 3 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">Tipo de cuenta y tarjeta</h2>
                    <p className="reg-card-sub">Elige las opciones que mejor se adapten a ti.</p>

                    <label className="reg-label" style={{ marginBottom: ".75rem", display: "block" }}>Tipo de cuenta</label>
                    <div className="reg-tipo-grid" style={{ marginBottom: "1.75rem" }}>
                        {TIPO_CUENTA.map((t) => (
                            <button
                                key={t.id}
                                className={`reg-tipo-btn ${tipoCuenta === t.id ? "reg-tipo-btn--sel" : ""}`}
                                onClick={() => setTipoCuenta(t.id)}
                            >
                                <span className="reg-tipo-icon">{t.icon}</span>
                                <span className="reg-tipo-label">{t.label}</span>
                                <span className="reg-tipo-desc">{t.desc}</span>
                            </button>
                        ))}
                    </div>

                    <label className="reg-label" style={{ marginBottom: ".75rem", display: "block" }}>Tipo de tarjeta</label>
                    <div className="reg-tipo-grid">
                        {TIPO_TARJETA.map((t) => (
                            <button
                                key={t.id}
                                className={`reg-tipo-btn ${tipoTarjeta === t.id ? "reg-tipo-btn--sel" : ""}`}
                                onClick={() => setTipoTarjeta(t.id)}
                            >
                                <span className="reg-tipo-icon">{t.icon}</span>
                                <span className="reg-tipo-label">{t.label}</span>
                                <span className="reg-tipo-desc">{t.desc}</span>
                            </button>
                        ))}
                    </div>

                    <div className="reg-btn-row" style={{ marginTop: "1.5rem" }}>
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(2); }}>← Atrás</button>
                        <button className="reg-btn-next" onClick={() => { limpiarError(); setPaso(4); }}>
                            Continuar →
                        </button>
                    </div>
                </div>
            )}

            {/* PASO 4: Confirmar */}
            {paso === 4 && !registroExitoso && (
                <div className="reg-card reg-fade">
                    <h2 className="reg-card-title">Confirmar registro</h2>
                    <p className="reg-card-sub">Revisa tus datos antes de crear la cuenta.</p>

                    <div className="reg-resumen">
                        <ResumenFila label="Correo"       valor={correo} />
                        <ResumenFila label="Nombre"       valor={`${nombre} ${apellido}`} />
                        <ResumenFila label="Teléfono"     valor={telefono} />
                        <ResumenFila label="Edad"         valor={`${edad} años`} />
                        <ResumenFila label="Dirección"    valor={direccion} />
                        <ResumenFila label="Tipo cuenta"  valor={tipoCuenta.charAt(0).toUpperCase() + tipoCuenta.slice(1)} />
                        <ResumenFila label="Tipo tarjeta" valor={tipoTarjeta.charAt(0).toUpperCase() + tipoTarjeta.slice(1)} />
                    </div>

                    {error && <div className="reg-error">{error}</div>}

                    <div className="reg-btn-row">
                        <button className="reg-btn-back" onClick={() => { limpiarError(); setPaso(3); }}>← Atrás</button>
                        <button 
                            className="reg-btn-confirm" 
                            onClick={handleSubmit} 
                            disabled={loading}
                        >
                            {loading ? "Registrando…" : "✓ Crear cuenta"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}