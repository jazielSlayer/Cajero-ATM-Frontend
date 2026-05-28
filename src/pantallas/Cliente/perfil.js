import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import "../../Css/Perfil.css";
import { getDatosUsuario, getSaldosUsuario } from "../../Api/Api_cliente/Datos_cliente";
import ImportarNav from "../../Importar nav/importar-nav";
import { useAuth } from "../../Authcontext";

// ── Re-usa las mismas utilidades ──────────────────────────────────────────────
const SIMBOLOS = {
    BOB: "Bs.", USD: "$", EUR: "€", PEN: "S/",
    ARS: "$",  BRL: "R$", GBP: "£", JPY: "¥",
};

const fmtNum = (n, decimales = 2) =>
    Number(n || 0).toLocaleString("es-BO", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    });

const fmtMoneda = (monto, codigo = "BOB") =>
    `${SIMBOLOS[codigo] || codigo} ${fmtNum(monto)}`;

// Colores inline SOLO para las piezas dinámicas de saldo (imposible hacer con clases puras)
const COLORES_MONEDA = {
    BOB: { bg: "rgba(76,201,240,0.08)",  border: "rgba(76,201,240,0.25)",  text: "#4cc9f0" },
    USD: { bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)",  text: "#4ade80" },
    EUR: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", text: "#a78bfa" },
    PEN: { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24" },
    default: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#f87171" },
};
const colorMoneda = (c) => COLORES_MONEDA[c] || COLORES_MONEDA.default;


// ── Subcomponentes ────────────────────────────────────────────────────────────

/*function Avatar({ nombre, apellido }) {
    const initials = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
    return <div className="pf-avatar">{initials}</div>;
}*/

function InfoField({ icon, label, value, mono = false, color }) {
    return (
        <div className="pf-info-field">
            <span className="pf-info-icon-wrap" style={{ color: color || "rgba(255,255,255,0.4)" }}>
                <i className={`ti ${icon}`} />
            </span>
            <div className="pf-info-body">
                <div className="pf-info-label">{label}</div>
                <div
                    className={`pf-info-value${mono ? " pf-info-value--mono" : ""}`}
                    style={{ color: color || "#f0f0f0" }}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, variant }) {
    return (
        <div className={`pf-stat-card pf-stat-card--${variant}`}>
            <div className="pf-stat-header">
                <i className={`ti ${icon} pf-stat-icon`} />
                <span className="pf-stat-label">{label}</span>
            </div>
            <div className="pf-stat-value">{value}</div>
        </div>
    );
}

function SectionHeader({ icon, title, iconColor }) {
    return (
        <>
            <div className="pf-section-header">
                <i className={`ti ${icon} pf-section-icon`} style={{ color: iconColor }} />
                <h2 className="pf-section-title">{title}</h2>
            </div>
            <div className="pf-divider" />
        </>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
export default function PerfilCliente() {
    const { cerrarSesion } = useAuth();
    const navigate = useNavigate();

    const [datos,    setDatos]    = useState(null);
    const [saldos,   setSaldos]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [oculto,   setOculto]   = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [copied,   setCopied]   = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);

    const handleLogout = () => {
        if (!confirmLogout) { setConfirmLogout(true); return; }
        cerrarSesion();
        navigate("/", { replace: true });
    };

    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        if (!sesion) {
            setError("Sin sesión activa. Por favor inicia sesión.");
            setLoading(false);
            return;
        }

        const { nombre_completo } = JSON.parse(sesion);

        Promise.all([
            getDatosUsuario(nombre_completo),
            getSaldosUsuario(nombre_completo),
        ])
            .then(([d, s]) => {
                setDatos(d);
                setSaldos(s.saldos || []);
            })
            .catch((err) => setError(err.message || "Error al cargar el perfil"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="pf-page">
            <ImportarNav />
            <div className="pf-spinner-wrap">
                <div className="pf-spinner" />
                <p className="pf-spinner-txt">Cargando perfil…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="pf-page">
            <ImportarNav />
            <p className="pf-error">{error}</p>
        </div>
    );

    const { usuario, depositos, retiros, transferencias } = datos;

    const mask = (v) => oculto ? "•••••••••••" : v;

    const totalDepositos      = depositos.reduce((s, t)      => s + parseFloat(t.Monto || 0), 0);
    const totalRetiros        = retiros.reduce((s, t)        => s + parseFloat(t.Monto || 0), 0);
    const totalTransferencias = transferencias.reduce((s, t) => s + parseFloat(t.Monto || 0), 0);

    const saldoBOB       = saldos.find(s => s.moneda === "BOB");
    const saldoPrincipal = saldoBOB ? parseFloat(saldoBOB.saldo) : parseFloat(usuario.cuenta.saldo);

    const fechaVenc = usuario.tarjeta.fecha_vencimiento
        ? new Date(usuario.tarjeta.fecha_vencimiento).toLocaleDateString("es-ES", { month: "2-digit", year: "2-digit" })
        : "N/A";

    const handleCopyAccount = () => {
        navigator.clipboard?.writeText(usuario.cuenta.numero_cuenta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className="pf-page">
            <ImportarNav />

            <div className="pf-contenedor">

                {/* ══ HERO ══════════════════════════════════════════════════ */}
                <div className="pf-card pf-hero">
                    <div className="pf-hero-bg" />
                    <div className="pf-hero-inner">
                        {/*<Avatar nombre={usuario.nombre} apellido={usuario.apellido} />*/}

                        <div className="pf-hero-meta">
                            <div className="pf-hero-eyebrow">Perfil del cliente</div>
                            <h1 className="pf-hero-nombre">{usuario.nombre_completo}</h1>
                            <div className="pf-hero-tags">
                                <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
                                <span className="pf-tag-estado">● Cuenta {usuario.cuenta.estado}</span>
                            </div>
                        </div>

                        <div className="pf-hero-actions">
                            <button
                                onClick={() => setOculto(!oculto)}
                                className={`pf-btn-icon${oculto ? " pf-btn-icon--active" : ""}`}
                                title={oculto ? "Mostrar datos" : "Ocultar datos"}
                            >
                                <i className={`ti ${oculto ? "ti-eye" : "ti-eye-off"}`} />
                            </button>
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`pf-btn-icon${editMode ? " pf-btn-icon--active" : ""}`}
                                title="Editar perfil"
                            >
                                <i className="ti ti-pencil" />
                            </button>
                            <button
                                onClick={handleLogout}
                                onMouseLeave={() => setConfirmLogout(false)}
                                className={`pf-btn-icon pf-btn-icon--logout${confirmLogout ? " pf-btn-icon--confirm" : ""}`}
                                title={confirmLogout ? "Clic de nuevo para confirmar" : "Cerrar sesión"}
                            >
                                <i className={`ti ${confirmLogout ? "ti-alert-triangle" : "ti-logout"}`} />
                                <span className="pf-btn-logout-label">
                                    {confirmLogout ? "¿Confirmar?" : "Cerrar sesión"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ STATS RÁPIDAS ════════════════════════════════════════ */}
                <div className="pf-stats-grid">
                    <StatCard
                        icon="ti-arrow-down-circle"
                        label="Total depositado"
                        value={fmtMoneda(totalDepositos)}
                        variant="green"
                    />
                    <StatCard
                        icon="ti-arrow-up-circle"
                        label="Total retirado"
                        value={fmtMoneda(totalRetiros)}
                        variant="red"
                    />
                    <StatCard
                        icon="ti-arrows-exchange"
                        label="Transferencias"
                        value={fmtMoneda(totalTransferencias)}
                        variant="blue"
                    />
                    <StatCard
                        icon="ti-wallet"
                        label="Saldo BOB"
                        value={oculto ? "•••••" : fmtMoneda(saldoPrincipal)}
                        variant="cyan"
                    />
                </div>

                {/* ══ COLUMNAS PRINCIPALES ════════════════════════════════ */}
                <div className="pf-columnas">

                    {/* ── Col izquierda ── */}
                    <div className="pf-col">

                        {/* Datos personales */}
                        <div className="pf-card">
                            <SectionHeader icon="ti-user" title="Datos Personales" iconColor="#4cc9f0" />

                            <InfoField icon="ti-user-circle" label="Nombre completo"    value={usuario.nombre_completo} color="#ffffff" />
                            <InfoField icon="ti-mail"        label="Correo electrónico" value={mask(usuario.correo)} mono />
                            <InfoField icon="ti-phone"       label="Teléfono"           value={mask(usuario.telefono)} mono color="#4cc9f0" />
                            <InfoField icon="ti-map-pin"     label="Dirección"          value={mask(usuario.direccion)} />
                            <InfoField icon="ti-calendar"    label="Edad"               value={`${usuario.edad} años`} color="#a78bfa" />

                            {editMode && (
                                <button className="pf-btn-editar">
                                    <i className="ti ti-edit" style={{ marginRight: 6 }} />
                                    Solicitar actualización de datos
                                </button>
                            )}
                        </div>

                        {/* Seguridad */}
                        <div className="pf-card">
                            <SectionHeader icon="ti-shield-lock" title="Seguridad" iconColor="#f87171" />

                            <div className="pf-security-row">
                                <div className="pf-security-left">
                                    <i className="ti ti-lock pf-security-icon" style={{ color: "#4ade80" }} />
                                    <div>
                                        <div className="pf-security-lbl">Contraseña</div>
                                        <div className="pf-security-val">••••••••</div>
                                    </div>
                                </div>
                                <span className="pf-badge pf-badge--green">Activa</span>
                            </div>

                            <div className="pf-security-row">
                                <div className="pf-security-left">
                                    <i className="ti ti-device-mobile pf-security-icon" style={{ color: "#4cc9f0" }} />
                                    <div>
                                        <div className="pf-security-lbl">PIN de tarjeta</div>
                                        <div className="pf-security-val">{oculto ? "••••" : "****"}</div>
                                    </div>
                                </div>
                                <span className="pf-badge pf-badge--cyan">Configurado</span>
                            </div>

                            <div className="pf-security-note">
                                <i className="ti ti-info-circle" />
                                <span>Para cambiar tu contraseña o PIN, contacta con soporte.</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Col derecha ── */}
                    <div className="pf-col">

                        {/* Cuenta bancaria */}
                        <div className="pf-card">
                            <SectionHeader icon="ti-building-bank" title="Cuenta Bancaria" iconColor="#4ade80" />

                            <InfoField icon="ti-hash"          label="Número de cuenta"      value={mask(usuario.cuenta.numero_cuenta)} mono color="#4cc9f0" />
                            <InfoField icon="ti-coin"          label="Saldo principal (BOB)"  value={oculto ? "•••••••" : fmtMoneda(saldoPrincipal)} mono color="#4ade80" />
                            <InfoField icon="ti-toggle-right"  label="Estado"                value={usuario.cuenta.estado} color="#4ade80" />

                            <button onClick={handleCopyAccount} className="pf-btn-copiar">
                                <i className={`ti ${copied ? "ti-check" : "ti-copy"}`} style={{ marginRight: 6 }} />
                                {copied ? "¡Copiado!" : "Copiar número de cuenta"}
                            </button>
                        </div>

                        {/* Tarjeta bancaria visual */}
                        <div className="pf-tarjeta">
                            <div className="pf-tarjeta-top">
                                <div className="pf-tarjeta-chip">
                                    <i className="ti ti-cpu" />
                                </div>
                                <span className="pf-tarjeta-tipo">{usuario.tarjeta.tipo_tarjeta}</span>
                            </div>

                            <div className="pf-tarjeta-numero">
                                {oculto
                                    ? "**** **** **** ****"
                                    : (usuario.tarjeta.numero_tarjeta || "").replace(/(.{4})/g, "$1 ").trim()
                                }
                            </div>

                            <div className="pf-tarjeta-bottom">
                                <div>
                                    <div className="pf-tarjeta-eyebrow">Titular</div>
                                    <div className="pf-tarjeta-val">{usuario.nombre} {usuario.apellido}</div>
                                </div>
                                <div>
                                    <div className="pf-tarjeta-eyebrow">Vence</div>
                                    <div className="pf-tarjeta-val">{fechaVenc}</div>
                                </div>
                            </div>
                        </div>

                        {/* Saldos por moneda */}
                        <div className="pf-card">
                            <SectionHeader icon="ti-wallet" title="Saldos en Cartera" iconColor="#a78bfa" />

                            {saldos.length === 0 ? (
                                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8rem", fontStyle: "italic" }}>
                                    Sin saldos disponibles.
                                </p>
                            ) : (
                                <div className="pf-saldos-list">
                                    {saldos.map(s => {
                                        const col = colorMoneda(s.moneda);
                                        const sim = s.simbolo || SIMBOLOS[s.moneda] || s.moneda;
                                        const pct = saldoPrincipal > 0
                                            ? Math.min((parseFloat(s.saldo) / saldoPrincipal) * 100, 100)
                                            : 0;
                                        return (
                                            <div
                                                key={s.moneda}
                                                className="pf-saldo-item"
                                                style={{ background: col.bg, borderColor: col.border }}
                                            >
                                                <div className="pf-saldo-row">
                                                    <div className="pf-saldo-left">
                                                        <span
                                                            className="pf-saldo-codigo"
                                                            style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
                                                        >
                                                            {s.moneda}
                                                        </span>
                                                        <span className="pf-saldo-nombre">{s.nombre_moneda}</span>
                                                    </div>
                                                    <span className="pf-saldo-monto">
                                                        {oculto ? "•••••" : `${sim} ${fmtNum(s.saldo)}`}
                                                    </span>
                                                </div>
                                                <div className="pf-saldo-bar-track">
                                                    <div
                                                        className="pf-saldo-bar-fill"
                                                        style={{ width: `${pct}%`, background: col.text }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}