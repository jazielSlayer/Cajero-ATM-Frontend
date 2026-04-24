import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../Css/cliente.css";
import ImportarNav from "../../Importar nav/importar-nav";
import {
    getDatosUsuario,
    getSaldosUsuario,
    getTasasCambio,
} from "../../Api/Api_cliente/Datos_cliente";

// ── Símbolos conocidos ────────────────────────────────────────────────────────
const SIMBOLOS = {
    BOB: "Bs.",
    USD: "$",
    EUR: "€",
    PEN: "S/",
    ARS: "$",
    BRL: "R$",
    GBP: "£",
    JPY: "¥",
};

const fmtNum = (n, decimales = 2) =>
    Number(n || 0).toLocaleString("es-BO", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    });

const fmtMoneda = (monto, codigo = "BOB") => {
    const sim = SIMBOLOS[codigo] || codigo;
    return `${sim} ${fmtNum(monto)}`;
};

const COLORES_MONEDA = {
    BOB: { bg: "rgba(76,201,240,0.08)",  border: "rgba(76,201,240,0.25)",  text: "#4cc9f0" },
    USD: { bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.25)",  text: "#4ade80" },
    EUR: { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", text: "#a78bfa" },
    PEN: { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24" },
    default: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", text: "#f87171" },
};

const colorMoneda = (codigo) => COLORES_MONEDA[codigo] || COLORES_MONEDA.default;

function MonedaBadge({ codigo }) {
    const col = colorMoneda(codigo);
    return (
        <span style={{
            background:    col.bg,
            color:         col.text,
            border:        `1px solid ${col.border}`,
            borderRadius:  "4px",
            padding:       "2px 7px",
            fontSize:      "0.62rem",
            fontWeight:    700,
            letterSpacing: "0.08em",
            whiteSpace:    "nowrap",
            fontFamily:    "'DM Mono', monospace",
        }}>
            {codigo}
        </span>
    );
}

function MontoTransaccion({ tx, tipo }) {
    const moneda  = tx.moneda_saldo || "BOB";
    const sim     = SIMBOLOS[moneda] || moneda;
    const esPos   = tipo === "Deposito";
    const color   = esPos ? "#4ade80" : "#f87171";
    const prefijo = esPos ? "+" : "−";

    return (
        <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ color, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", fontSize: "0.85rem" }}>
                {prefijo}{sim} {fmtNum(tx.Monto)}
            </span>
            {moneda !== "BOB" && tx.Monto_BOB != null && (
                <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.65rem", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace" }}>
                    ≈ Bs. {fmtNum(tx.Monto_BOB)}
                </span>
            )}
        </span>
    );
}

// ── Modal de Saldos ──────────────────────────────────────────────────────────
function SaldosModal({ saldos, loadingSaldos, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="holo-shine" />
                <div className="modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className="ti ti-wallet" style={{ color: "#4cc9f0", fontSize: "1.1rem" }} />
                        <h2 className="section-title" style={{ margin: 0 }}>Saldos en Cartera</h2>
                    </div>
                    <button className="btn-close-modal" onClick={onClose} title="Cerrar">
                        <i className="ti ti-x" />
                    </button>
                </div>
                <div className="modal-divider" />
                {loadingSaldos ? (
                    <div className="loading-row">
                        <div className="spinner" style={{ borderTopColor: "#4cc9f0" }} />
                        <span>Cargando saldos…</span>
                    </div>
                ) : saldos.length === 0 ? (
                    <p className="empty-state">Sin saldos disponibles</p>
                ) : (
                    <div className="saldos-grid">
                        {saldos.map((s) => {
                            const col = colorMoneda(s.moneda);
                            const sim = s.simbolo || SIMBOLOS[s.moneda] || s.moneda;
                            return (
                                <div key={s.moneda} className="saldo-card" style={{ borderColor: col.border }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ color: col.text, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>{s.moneda}</span>
                                        <span style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}`, fontSize: "0.62rem", fontWeight: 700, padding: "1px 7px", borderRadius: "20px" }}>{sim}</span>
                                    </div>
                                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.67rem", marginTop: "2px" }}>{s.nombre_moneda}</span>
                                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.02em", fontFamily: "'DM Mono', monospace", marginTop: "6px" }}>
                                        {sim} {fmtNum(s.saldo)}
                                    </span>
                                    {s.ultima_actualizacion && (
                                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", marginTop: "4px" }}>
                                            {new Date(s.ultima_actualizacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <p className="modal-note">
                    <i className="ti ti-info-circle" style={{ marginRight: "4px" }} />
                    Los saldos se actualizan en tiempo real según tus operaciones registradas.
                </p>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
function Cliente() {
    const { t } = useTranslation();

    const [datos,          setDatos]          = useState(null);
    const [saldos,         setSaldos]         = useState([]);
    const [tasas,          setTasas]          = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [loadingSaldos,  setLoadingSaldos]  = useState(true);
    const [loadingTasas,   setLoadingTasas]   = useState(true);
    const [error,          setError]          = useState(null);
    const [datosOcultos,         setDatosOcultos]         = useState(false);
    const [datosOcultosTarjeta,  setDatosOcultosTarjeta]  = useState(false);
    const [modalSaldos,          setModalSaldos]          = useState(false);

    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        if (!sesion) { setError(t("cli.sin_sesion")); setLoading(false); return; }

        const { nombre_completo } = JSON.parse(sesion);
        if (!nombre_completo) { setError(t("cli.sin_nombre")); setLoading(false); return; }

        getDatosUsuario(nombre_completo)
            .then((data) => { setDatos(data); setLoading(false); })
            .catch(() => { setError(t("cli.error_carga")); setLoading(false); });

        getSaldosUsuario(nombre_completo)
            .then((data) => { setSaldos(data.saldos || []); })
            .catch(() => { setSaldos([]); })
            .finally(() => setLoadingSaldos(false));

        getTasasCambio()
            .then(setTasas)
            .catch(() => setTasas([]))
            .finally(() => setLoadingTasas(false));
    }, [t]);

    if (loading) return (
        <div className="cliente">
            <ImportarNav />
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh", flexDirection:"column", gap:"14px" }}>
                <div className="spinner" style={{ width:36, height:36, borderTopColor:"#4cc9f0" }} />
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", letterSpacing:"0.08em", textTransform:"uppercase" }}>{t("cli.cargando")}</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="cliente">
            <ImportarNav />
            <p className="error">{error}</p>
        </div>
    );

    const { usuario, transferencias, depositos, retiros } = datos;

    const ocultar = (valor) => (datosOcultos ? "•••••••••••••" : valor);

    const tarjetaVisible = datosOcultosTarjeta
        ? "**** **** **** ****"
        : usuario.tarjeta.numero_tarjeta || "**** **** ****";

    const fechaVenc = usuario.tarjeta.fecha_vencimiento
        ? new Date(usuario.tarjeta.fecha_vencimiento).toLocaleDateString("es-ES", { month: "2-digit", year: "2-digit" })
        : "N/A";

    const ultimasTransacciones = [
        ...transferencias.map((tx) => ({ ...tx, _tipo: "Transferencia" })),
        ...depositos.map((tx)      => ({ ...tx, _tipo: "Deposito" })),
        ...retiros.map((tx)        => ({ ...tx, _tipo: "Retiro" })),
    ]
        .sort((a, b) => new Date(b.Fecha_transaccion) - new Date(a.Fecha_transaccion))
        .slice(0, 6);

    const saldoBOB = saldos.find((s) => s.moneda === "BOB");
    const saldoPrincipal = saldoBOB
        ? parseFloat(saldoBOB.saldo)
        : parseFloat(usuario.cuenta.saldo);

    return (
        <div className="contenedor">
            <ImportarNav />

            {/* ── Modal Saldos ── */}
            {modalSaldos && (
                <SaldosModal
                    saldos={saldos}
                    loadingSaldos={loadingSaldos}
                    onClose={() => setModalSaldos(false)}
                />
            )}

            {/* ════ FILA SUPERIOR: Cuenta + Tarjeta ════ */}
            <div className="info-cards">
                {/* Cuenta */}
                <div className="account-info holo-card">
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <i className="ti ti-building-bank" style={{ color:"rgba(255,255,255,0.35)", fontSize:"1rem" }} />
                            <h2 className="section-title">{t("cli.cuenta")}</h2>
                        </div>
                        <button className="btn-ocultar" onClick={() => setDatosOcultos(!datosOcultos)} title={datosOcultos ? t("cli.mostrar_datos") : t("cli.ocultar_datos")}>
                            <i className={`ti ${datosOcultos ? "ti-eye" : "ti-eye-off"}`} />
                        </button>
                    </div>
                    <div className="section-divider" />
                    <div className="info-row">
                        <span className="label">{t("cli.numero")}</span>
                        <span className="info-val mono">{ocultar(usuario.cuenta.numero_cuenta)}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">{t("cli.saldo")} BOB</span>
                        <span className="info-val saldo-principal mono">{ocultar(fmtMoneda(saldoPrincipal, "BOB"))}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">{t("cli.estado")}</span>
                        <span className="info-val estado-badge">{usuario.cuenta.estado}</span>
                    </div>
                    <button className="btn-saldos-cartera" onClick={() => setModalSaldos(true)}>
                        <i className="ti ti-wallet" />
                        Ver saldos en cartera
                        <i className="ti ti-chevron-right" style={{ marginLeft:"auto" }} />
                    </button>
                </div>

                {/* Tarjeta */}
                <div className="card-info holo-card tarjeta-banco">
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <span className="chip"><i className="ti ti-cpu" /></span>
                        <button className="btn-ocultar" onClick={() => setDatosOcultosTarjeta(!datosOcultosTarjeta)} title={datosOcultosTarjeta ? t("cli.mostrar_datos") : t("cli.ocultar_datos")}>
                            <i className={`ti ${datosOcultosTarjeta ? "ti-eye" : "ti-eye-off"}`} />
                        </button>
                    </div>
                    <div className="tarjeta-numero">{tarjetaVisible}</div>
                    <div className="tarjeta-bottom">
                        <div>
                            <span className="label-small">{t("cli.titular")}</span>
                            <p className="tarjeta-titular">{usuario.nombre} {usuario.apellido}</p>
                        </div>
                        <div>
                            <span className="label-small">{t("cli.vence")}</span>
                            <p className="tarjeta-venc">{fechaVenc}</p>
                        </div>
                        <div>
                            <span className="label-small">{t("cli.tipo")}</span>
                            <p className="tarjeta-tipo">{usuario.tarjeta.tipo_tarjeta}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════ TASAS DE CAMBIO — compacto ════ */}
            <div style={{ margin: "0 20px 20px" }}>
                <div className="holo-card compact-section">
                    <div className="holo-shine" />
                    <div className="card-header-row" style={{ marginBottom: "12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <i className="ti ti-currency-exchange" style={{ color:"#4ade80", fontSize:"1rem" }} />
                            <h2 className="section-title" style={{ margin:0 }}>Tasas de Cambio</h2>
                            <span className="badge-source">vía DolarApi</span>
                        </div>
                    </div>
                    <div className="section-divider" />
                    {loadingTasas ? (
                        <div className="loading-row">
                            <div className="spinner" style={{ borderTopColor:"#4ade80" }} />
                            <span>Cargando tasas…</span>
                        </div>
                    ) : tasas.length === 0 ? (
                        <div className="error-inline">
                            <i className="ti ti-wifi-off" />
                            No se pudo obtener las tasas en este momento.
                        </div>
                    ) : (
                        <div style={{ overflowX:"auto" }}>
                            <table className="tasas-table">
                                <thead>
                                    <tr>
                                        {["Moneda", "Compra", "Venta", "Spread", "Actualizado"].map((h) => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasas.map((tx, i) => {
                                        const spread = tx.venta && tx.compra ? (tx.venta - tx.compra).toFixed(4) : "—";
                                        const cod    = tx.moneda || "FX";
                                        const col    = colorMoneda(cod);
                                        return (
                                            <tr key={i}>
                                                <td>
                                                    <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                                                        <span style={{ background:col.bg, color:col.text, border:`1px solid ${col.border}`, borderRadius:"4px", padding:"1px 7px", fontSize:"0.68rem", fontWeight:800, letterSpacing:"0.08em", fontFamily:"'DM Mono',monospace" }}>{cod}</span>
                                                        <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.72rem" }}>{tx.nombre || ""}</span>
                                                    </div>
                                                </td>
                                                <td><span className="tasa-compra mono">{tx.compra != null ? `Bs. ${fmtNum(tx.compra, 4)}` : "—"}</span></td>
                                                <td><span className="tasa-venta mono">{tx.venta != null ? `Bs. ${fmtNum(tx.venta, 4)}` : "—"}</span></td>
                                                <td><span className="mono" style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>{spread !== "—" ? `Bs. ${spread}` : "—"}</span></td>
                                                <td style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.68rem", whiteSpace:"nowrap" }}>
                                                    {tx.fechaActualizacion ? new Date(tx.fechaActualizacion).toLocaleDateString("es-ES", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <p className="table-note">
                                <i className="ti ti-info-circle" />
                                Tasas de referencia. Los valores reales pueden variar según el tipo de operación.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ════ HISTORIAL ════ */}
            <div className="historial">
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
                    
                    <h2 className="section-title" style={{ color:"#fff", margin:0 }}>{t("cli.ultimas_transacciones")}</h2>
                </div>
                <div className="section-divider" style={{ marginBottom:"16px" }} />
                {ultimasTransacciones.length === 0 ? (
                    <p className="empty-state">{t("cli.sin_transacciones")}</p>
                ) : (
                    <div className="tabla-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("cli.col_fecha")}</th>
                                    <th>{t("cli.col_tipo")}</th>
                                    <th>{t("cli.col_metodo")}</th>
                                    <th>Moneda</th>
                                    <th>{t("cli.col_monto")}</th>
                                    <th>{t("cli.col_descripcion")}</th>
                                    <th>{t("cli.col_destinatario")}</th>
                                    <th>{t("cli.col_estado")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimasTransacciones.map((tx) => {
                                    const moneda = tx.moneda_saldo || "BOB";
                                    return (
                                        <tr key={tx.transaccion_id}>
                                            <td data-label={t("cli.col_fecha")}>
                                                {new Date(tx.Fecha_transaccion).toLocaleDateString("es-ES")}
                                            </td>
                                            <td data-label={t("cli.col_tipo")}>{tx._tipo}</td>
                                            <td data-label={t("cli.col_metodo")}>{tx.Metodo_transaccion}</td>
                                            <td data-label="Moneda"><MonedaBadge codigo={moneda} /></td>
                                            <td data-label={t("cli.col_monto")}><MontoTransaccion tx={tx} tipo={tx._tipo} /></td>
                                            <td data-label={t("cli.col_descripcion")}>{tx.Descripcion ?? "—"}</td>
                                            <td data-label={t("cli.col_destinatario")}>{tx.nombre_destinatario ?? "—"}</td>
                                            <td data-label={t("cli.col_estado")}>{tx.estado_transaccion}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
    );
}

export default Cliente;