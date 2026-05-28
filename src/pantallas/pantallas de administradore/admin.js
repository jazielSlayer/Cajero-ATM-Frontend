import { useEffect, useState } from "react";
import "./../../Css/pantallas de los admins/Admin.css";
import ImportarNav from "../../Importar nav/import-nav-admin";
import { getDashboard } from "../../Api/Api_admin/Admin";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n, decimales = 2) =>
    Number(n || 0).toLocaleString("es-BO", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    });

const TIPO_COLORES = {
    Deposito:      { color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.25)",  icon: "ti-arrow-bar-to-down" },
    Retiro:        { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", icon: "ti-arrow-bar-up"       },
    Transferencia: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.25)",  icon: "ti-arrows-exchange"    },
};

function TipoBadge({ tipo }) {
    const col = TIPO_COLORES[tipo] || { color: "#c9a84c", bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.25)" };
    return (
        <span style={{
            background:   col.bg,
            color:        col.color,
            border:       `1px solid ${col.border}`,
            borderRadius: "4px",
            padding:      "2px 8px",
            fontSize:     "0.65rem",
            fontWeight:   700,
            letterSpacing:"0.08em",
            fontFamily:   "'DM Mono', monospace",
            whiteSpace:   "nowrap",
        }}>
            {tipo}
        </span>
    );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ icon, iconClass, label, value, trend }) {
    return (
        <div className="holo-card metric-card">
            <div className="holo-shine" />
            <div className="card-header-row">
                <div className={`metric-icon ${iconClass}`}>
                    <i className={`ti ${icon}`} />
                </div>
            </div>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            {trend && <div className="metric-trend">{trend}</div>}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
function Admin() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        getDashboard()
            .then(setData)
            .catch(() => setError("Error al cargar el dashboard."))
            .finally(() => setLoading(false));
    }, []);

    // ── Loading ──
    if (loading) return (
        <div className="contenedor">
            <ImportarNav />
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh", flexDirection:"column", gap:"14px" }}>
                <div className="spinner" style={{ width:36, height:36, borderTopColor:"#4cc9f0" }} />
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.8rem", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                    Cargando dashboard…
                </p>
            </div>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className="contenedor">
            <ImportarNav />
            <div style={{ margin:"20px" }}>
                <div className="error-inline">
                    <i className="ti ti-alert-triangle" />
                    {error}
                </div>
            </div>
        </div>
    );

    const {
        total_usuarios,
        total_cuentas,
        total_tarjetas,
        transacciones_hoy,
        monto_movido_hoy,
        saldo_total_bob,
        transacciones_por_tipo,
    } = data;

    return (
        <div className="contenedor">
            <ImportarNav />

            {/* ── Header ── */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1 className="admin-title">Dashboard</h1>
                    <span className="admin-subtitle">Panel de Administración</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"0.7rem", color:"#888", letterSpacing:"0.06em" }}>
                    <i className="ti ti-clock" style={{ fontSize:"0.9rem" }} />
                    {new Date().toLocaleDateString("es-ES", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
                </div>
            </div>

            {/* ── Métricas ── */}
            <div className="metrics-grid">
                <MetricCard
                    icon="ti-users"
                    iconClass="cyan"
                    label="Usuarios Activos"
                    value={fmtNum(total_usuarios, 0)}
                    trend="Estado: activo"
                />
                <MetricCard
                    icon="ti-building-bank"
                    iconClass="green"
                    label="Cuentas Activas"
                    value={fmtNum(total_cuentas, 0)}
                    trend="Estado: activa"
                />
                <MetricCard
                    icon="ti-credit-card"
                    iconClass="purple"
                    label="Tarjetas Activas"
                    value={fmtNum(total_tarjetas, 0)}
                    trend="Estado: activa"
                />
                <MetricCard
                    icon="ti-refresh"
                    iconClass="orange"
                    label="Transacciones Hoy"
                    value={fmtNum(transacciones_hoy, 0)}
                    trend={`Bs. ${fmtNum(monto_movido_hoy)} movidos`}
                />
            </div>

            {/* ── Fila inferior: saldo total + transacciones por tipo ── */}
            <div className="dashboard-row">

                {/* Saldo total BOB */}
                <div className="holo-card" style={{ flex:"0 0 auto", minWidth:"260px", maxWidth:"320px" }}>
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <i className="ti ti-coin" style={{ color:"#c9a84c", fontSize:"1rem" }} />
                            <h2 className="section-title" style={{ margin:0 }}>Saldo Global</h2>
                        </div>
                    </div>
                    <div className="section-divider" />
                    <div className="saldo-label">Total en sistema (BOB)</div>
                    <div className="saldo-bob">Bs. {fmtNum(saldo_total_bob)}</div>
                    <div style={{ marginTop:"16px", padding:"10px 12px", background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"var(--radius-sm)" }}>
                        <div style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px" }}>
                            Monto movido hoy
                        </div>
                        <div style={{ fontFamily:"'DM Mono', monospace", fontWeight:700, color:"#fff", fontSize:"1rem" }}>
                            Bs. {fmtNum(monto_movido_hoy)}
                        </div>
                    </div>
                </div>

                {/* Transacciones por tipo */}
                <div className="holo-card" style={{ flex:1 }}>
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <i className="ti ti-chart-pie" style={{ color:"#a78bfa", fontSize:"1rem" }} />
                            <h2 className="section-title" style={{ margin:0 }}>Transacciones por Tipo</h2>
                        </div>
                        <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.2)", letterSpacing:"0.04em" }}>exitosas</span>
                    </div>
                    <div className="section-divider" />

                    {!transacciones_por_tipo || transacciones_por_tipo.length === 0 ? (
                        <p className="empty-state">Sin datos disponibles</p>
                    ) : (
                        <div style={{ overflowX:"auto" }}>
                            <table className="tipo-table">
                                <thead>
                                    <tr>
                                        {["Tipo", "Cantidad", "Monto Total"].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transacciones_por_tipo.map((row, i) => (
                                        <tr key={i}>
                                            <td><TipoBadge tipo={row.tipo} /></td>
                                            <td>
                                                <span style={{ fontFamily:"'DM Mono',monospace", color:"rgba(255,255,255,0.6)", fontSize:"0.82rem" }}>
                                                    {fmtNum(row.cantidad, 0)}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontFamily:"'DM Mono',monospace", color:"#4cc9f0", fontWeight:700, fontSize:"0.85rem" }}>
                                                    Bs. {fmtNum(row.monto_total)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Admin;