import { useEffect, useState, useCallback } from "react";
import "./../../Css/pantallas de los admins/Admin.css";
import "./../../Css/pantallas de los admins/AdminColas.css";
import ImportarNav from "../../Importar nav/import-nav-admin";
import {
    getAnalisisColas,
    calcularColasManual,
    getProbabilidadN,
} from "../../Api/Api_admin/Colas";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n, dec = 2) =>
    Number(n || 0).toLocaleString("es-BO", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
    });

const fmtMs = (ms) => {
    if (ms == null) return "—";
    if (ms < 1000) return `${fmtNum(ms, 1)} ms`;
    return `${fmtNum(ms / 1000, 2)} s`;
};

// ── MetricCard ────────────────────────────────────────────────────────────────
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

// ── Barra de progreso ─────────────────────────────────────────────────────────
function BarraProgreso({ valor, max, color = "#4cc9f0" }) {
    const pct = Math.min((valor / max) * 100, 100);
    return (
        <div className="barra-track">
            <div
                className="barra-fill"
                style={{
                    width: `${pct}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}88`,
                }}
            />
        </div>
    );
}

// ── Tarjeta de modelo M/M/s ───────────────────────────────────────────────────
function ModelCard({ titulo, modelo, accentColor = "#4cc9f0", destacado = false }) {
    if (!modelo) return null;

    if (modelo.error) {
        return (
            <div className="holo-card model-card">
                <div className="holo-shine" />
                <p className="model-card--error-text">
                    <i className="ti ti-alert-triangle" style={{ marginRight: 6 }} />
                    {titulo}: Sistema inestable (ρ ≥ 1)
                </p>
            </div>
        );
    }

    const rho = parseFloat(modelo.rho ?? modelo.rho_efectivo ?? 0);
    const rhoColor = rho > 0.85 ? "#f87171" : rho > 0.6 ? "#fb923c" : "#4ade80";

    const filas = [
        { label: "ρ  Utilización",      val: `${fmtNum(rho * 100, 1)}%`,                    color: rhoColor    },
        { label: "L  Clientes (sist)",  val: fmtNum(modelo.L),                              color: accentColor },
        { label: "Lq Cola promedio",    val: fmtNum(modelo.Lq),                             color: accentColor },
        { label: "W  Tiempo (sist)",    val: fmtMs(modelo.W_ms  ?? modelo.W),               color: "#a78bfa"   },
        { label: "Wq Espera en cola",   val: fmtMs(modelo.Wq_ms ?? modelo.Wq),              color: "#a78bfa"   },
        { label: "P0 P(sistema vacío)", val: `${fmtNum((modelo.P0 ?? 0) * 100, 2)}%`,       color: "#c9a84c"   },
    ];

    return (
        <div
            className={`holo-card model-card${destacado ? " model-card--destacado" : ""}`}
            style={
                destacado
                    ? { boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6), 0 0 40px ${accentColor}44` }
                    : undefined
            }
        >
            <div className="holo-shine" />

            <div className="card-header-row" style={{ marginBottom: 12 }}>
                <span className="model-card__titulo" style={{ color: accentColor }}>
                    {titulo}
                </span>
                {destacado && (
                    <span
                        className="model-card__badge"
                        style={{
                            background: `${accentColor}22`,
                            color: accentColor,
                            border: `1px solid ${accentColor}44`,
                        }}
                    >
                        RECOMENDADO
                    </span>
                )}
            </div>

            <div className="section-divider" />

            <div className="model-card__filas">
                {filas.map(({ label, val, color }) => (
                    <div key={label} className="model-card__fila">
                        <span className="model-card__fila-label">{label}</span>
                        <span className="model-card__fila-val" style={{ color }}>{val}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 14 }}>
                <BarraProgreso valor={rho} max={1} color={rhoColor} />
                <p className="model-card__barra-label">Carga del sistema</p>
            </div>
        </div>
    );
}

// ── Gráfico de barras distribución horaria ────────────────────────────────────
function GraficoHorario({ datos }) {
    if (!datos || datos.length === 0) return <p className="empty-state">Sin datos horarios</p>;
    const max = Math.max(...datos.map(d => d.cantidad));

    return (
        <>
            <div className="grafico-horario">
                {datos.map(({ hora, cantidad }) => {
                    const pct = (cantidad / max) * 100;
                    const isHot = pct > 75;
                    const color = isHot ? "#f87171" : pct > 50 ? "#fb923c" : "#4cc9f0";
                    return (
                        <div
                            key={hora}
                            className="grafico-horario__col"
                            title={`${hora}:00 → ${cantidad} tx`}
                        >
                            <div
                                className="grafico-horario__barra"
                                style={{
                                    height: `${Math.max(pct, 4)}%`,
                                    background: color,
                                    boxShadow: isHot ? `0 0 6px ${color}88` : "none",
                                }}
                            />
                            {hora % 4 === 0 && (
                                <span className="grafico-horario__label">{hora}h</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="grafico-leyenda">
                {[["#4cc9f0", "Normal"], ["#fb923c", "Elevada"], ["#f87171", "Pico"]].map(([c, l]) => (
                    <div key={l} className="grafico-leyenda__item">
                        <div className="grafico-leyenda__dot" style={{ background: c }} />
                        <span className="grafico-leyenda__texto">{l}</span>
                    </div>
                ))}
            </div>
        </>
    );
}

// ── Campo de formulario reutilizable ─────────────────────────────────────────
function CampoCalc({ label, name, value, onChange, type = "number", placeholder = "" }) {
    return (
        <div className="calc-campo">
            <label htmlFor={name}>{label}</label>
            <input
                id={name}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="calc-input"
            />
        </div>
    );
}

// ── Calculadora Manual ────────────────────────────────────────────────────────
function CalculadoraManual() {
    const [form, setForm] = useState({ lambda: "", mu: "", s: "1", calcular_pn: false, n: "0" });
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

    const calcular = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await calcularColasManual({
                lambda: parseFloat(form.lambda),
                mu:     parseFloat(form.mu),
                s:      parseInt(form.s),
                calcular_pn: form.calcular_pn,
                n:      parseInt(form.n),
            });
            setResultado(res);
        } catch {
            setError("Error al calcular. Verifica los parámetros.");
        } finally {
            setLoading(false);
        }
    };

    const resultadoItems = resultado && !resultado.error ? [
        { k: "ρ",  v: `${fmtNum((resultado.rho ?? resultado.rho_efectivo ?? 0) * 100, 1)}%`, c: "#4ade80"  },
        { k: "L",  v: fmtNum(resultado.L),                                                   c: "#4cc9f0"  },
        { k: "Lq", v: fmtNum(resultado.Lq),                                                  c: "#4cc9f0"  },
        { k: "W",  v: fmtMs(resultado.W_ms  ?? resultado.W),                                 c: "#a78bfa"  },
        { k: "Wq", v: fmtMs(resultado.Wq_ms ?? resultado.Wq),                               c: "#a78bfa"  },
        { k: "P0", v: `${fmtNum((resultado.P0 ?? 0) * 100, 2)}%`,                            c: "#c9a84c"  },
    ] : [];

    return (
        <div className="holo-card" style={{ flex: 1 }}>
            <div className="holo-shine" />

            <div className="card-header-row">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="ti ti-calculator" style={{ color: "#a78bfa", fontSize: "1rem" }} />
                    <h2 className="section-title" style={{ margin: 0 }}>Calculadora Manual</h2>
                </div>
                <span className="modelos-sub">M/M/1 · M/M/s</span>
            </div>
            <div className="section-divider" />

            <div className="calc-grid-3">
                <CampoCalc label="λ Llegada (tx/h)"  name="lambda" value={form.lambda} onChange={set("lambda")} placeholder="ej. 60" />
                <CampoCalc label="μ Servicio (tx/h)" name="mu"     value={form.mu}     onChange={set("mu")}     placeholder="ej. 90" />
                <CampoCalc label="s Servidores"      name="s"      value={form.s}      onChange={set("s")}      placeholder="1"      />
            </div>

            <div className="calc-pn-row">
                <label className="calc-pn-label">
                    <input
                        type="checkbox"
                        checked={form.calcular_pn}
                        onChange={e => setForm(f => ({ ...f, calcular_pn: e.target.checked }))}
                        style={{ accentColor: "#a78bfa" }}
                    />
                    Calcular P(n)
                </label>
                {form.calcular_pn && (
                    <div className="calc-pn-n">
                        <CampoCalc label="n" name="pn" value={form.n} onChange={set("n")} placeholder="0" />
                    </div>
                )}
            </div>

            <button
                className="btn-calcular"
                onClick={calcular}
                disabled={loading || !form.lambda || !form.mu}
            >
                {loading
                    ? <><div className="spinner" style={{ width: 14, height: 14, borderTopColor: "#a78bfa" }} /> Calculando…</>
                    : <><i className="ti ti-math-function" /> Calcular</>
                }
            </button>

            {error && (
                <div className="error-inline" style={{ marginTop: 12 }}>
                    <i className="ti ti-alert-triangle" /> {error}
                </div>
            )}

            {resultadoItems.length > 0 && (
                <div className="calc-resultado">
                    <div className="calc-resultado-grid">
                        {resultadoItems.map(({ k, v, c }) => (
                            <div key={k} className="calc-resultado-item">
                                <span className="calc-resultado-key">{k}</span>
                                <span className="calc-resultado-val" style={{ color: c }}>{v}</span>
                            </div>
                        ))}
                    </div>
                    {resultado.Pn_calculado && (
                        <div className="calc-pn-resultado">
                            P({form.n}) = {fmtNum(resultado.Pn_calculado.Pn * 100, 4)}%
                        </div>
                    )}
                </div>
            )}

            {resultado?.error && (
                <div className="error-inline" style={{ marginTop: 12 }}>
                    <i className="ti ti-alert-triangle" /> {resultado.error}
                </div>
            )}
        </div>
    );
}

// ── Calculadora P(n) exacto ───────────────────────────────────────────────────
function CalculadoraPn() {
    const [n, setN] = useState("3");
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calcular = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getProbabilidadN(parseInt(n));
            setResultado(res);
        } catch (e) {
            setError(e.message || "Error al calcular P(n)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="holo-card" style={{ flex: "0 0 auto", minWidth: 260, maxWidth: 340 }}>
            <div className="holo-shine" />

            <div className="card-header-row">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="ti ti-percentage" style={{ color: "#c9a84c", fontSize: "1rem" }} />
                    <h2 className="section-title" style={{ margin: 0 }}>P(n) Exacto</h2>
                </div>
            </div>
            <div className="section-divider" />

            <p className="pn-desc">
                Probabilidad de exactamente <em>n</em> clientes en el sistema (con λ y μ reales de la BD).
            </p>

            <div className="pn-form-row">
                <div className="calc-campo" style={{ flex: 1 }}>
                    <label htmlFor="pn-n">Valor de n</label>
                    <input
                        id="pn-n"
                        type="number"
                        min="0"
                        value={n}
                        onChange={e => setN(e.target.value)}
                        className="calc-input"
                    />
                </div>
                <button
                    className="btn-calcular-pn"
                    onClick={calcular}
                    disabled={loading}
                >
                    {loading
                        ? <div className="spinner" style={{ width: 12, height: 12, borderTopColor: "#c9a84c" }} />
                        : <i className="ti ti-search" />
                    }
                    Calcular
                </button>
            </div>

            {error && (
                <div className="error-inline">
                    <i className="ti ti-alert-triangle" /> {error}
                </div>
            )}

            {resultado && (
                <div className="pn-resultado">
                    <p className="pn-resultado__porcentaje">
                        {fmtNum(resultado.Pn * 100, 4)}%
                    </p>
                    <p className="pn-resultado__desc">
                        P({n}) — probabilidad exacta
                    </p>
                    <div className="pn-resultado__params">
                        <span>λ = {fmtNum(resultado.lambda, 2)} tx/h</span>
                        <span>μ = {fmtNum(resultado.mu, 2)} tx/h</span>
                        <span>s = {resultado.s}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
function AdminColas() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const cargar = useCallback(() => {
        setLoading(true);
        setError(null);
        getAnalisisColas()
            .then(setData)
            .catch(() => setError("Error al cargar el análisis de colas."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="contenedor">
            <ImportarNav />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 14 }}>
                <div className="spinner" style={{ width: 36, height: 36, borderTopColor: "#a78bfa" }} />
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Calculando teoría de colas…
                </p>
            </div>
        </div>
    );

    // ── Error ────────────────────────────────────────────────────────────────
    if (error) return (
        <div className="contenedor">
            <ImportarNav />
            <div style={{ margin: "20px" }}>
                <div className="error-inline">
                    <i className="ti ti-alert-triangle" />
                    {error}
                    <button
                        onClick={cargar}
                        style={{ marginLeft: "auto", background: "none", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 4, color: "#f87171", fontSize: "0.7rem", padding: "3px 10px", cursor: "pointer" }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        </div>
    );

    const { parametros, modelos, distribucion_por_hora, lambda_por_tipo } = data;
    const { MM1, MM2, MM3, MM1_pico } = modelos;
    const recomendado = !MM1?.error ? "MM1" : !MM2?.error ? "MM2" : "MM3";
    const maxLambda = lambda_por_tipo?.length
        ? Math.max(...lambda_por_tipo.map(r => r.lambda_hora))
        : 1;

    return (
        <div className="contenedor">
            <ImportarNav />

            {/* ── Header ── */}
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1 className="admin-title">Teoría de Colas</h1>
                    <span className="admin-subtitle">Análisis de rendimiento ATM — Modelos M/M/s</span>
                </div>
                <div className="colas-header-meta">
                    <span className="colas-fuente-mu">{parametros.fuente_mu}</span>
                    <button className="btn-actualizar" onClick={cargar}>
                        <i className="ti ti-refresh" /> Actualizar
                    </button>
                </div>
            </div>

            {/* ── Métricas de parámetros ── */}
            <div className="metrics-grid">
                <MetricCard
                    icon="ti-arrow-left-right"
                    iconClass="cyan"
                    label="λ Llegada promedio"
                    value={`${fmtNum(parametros.lambda_promedio_hora, 1)}/h`}
                    trend={`${fmtNum(parametros.total_tx_24h, 0)} tx en 24h`}
                />
                <MetricCard
                    icon="ti-bolt"
                    iconClass="green"
                    label="λ Pico (hora más cargada)"
                    value={`${fmtNum(parametros.lambda_pico_hora ?? 0, 1)}/h`}
                    trend={parametros.hora_pico != null ? `Pico a las ${parametros.hora_pico}:00 hs` : "Sin datos pico"}
                />
                <MetricCard
                    icon="ti-server"
                    iconClass="purple"
                    label="μ Capacidad de servicio"
                    value={`${fmtNum(parametros.mu_tx_por_hora, 0)}/h`}
                    trend={`Tiempo promedio: ${fmtMs(parametros.tiempo_servicio_ms)}`}
                />
                <MetricCard
                    icon="ti-gauge"
                    iconClass={!MM1?.error && MM1?.rho < 0.85 ? "green" : "orange"}
                    label="ρ Utilización M/M/1"
                    value={MM1?.error ? "Inestable" : `${fmtNum((MM1?.rho ?? 0) * 100, 1)}%`}
                    trend={MM1?.error ? "λ ≥ μ, requiere más workers" : MM1?.rho < 0.7 ? "Carga saludable" : "Carga elevada"}
                />
            </div>

            {/* ── Comparativa de modelos ── */}
            <div className="modelos-header">
                <span className="section-title">Comparativa de Modelos</span>
                <span className="modelos-sub">carga promedio · 1, 2 y 3 workers</span>
            </div>
            <div className="modelos-grid">
                <ModelCard titulo="M/M/1"      modelo={MM1}      accentColor="#4cc9f0" destacado={recomendado === "MM1"} />
                <ModelCard titulo="M/M/2"      modelo={MM2}      accentColor="#4ade80" destacado={recomendado === "MM2"} />
                <ModelCard titulo="M/M/3"      modelo={MM3}      accentColor="#a78bfa" destacado={recomendado === "MM3"} />
                <ModelCard titulo="M/M/1 Pico" modelo={MM1_pico} accentColor="#f87171" />
            </div>

            {/* ── Distribución horaria + λ por tipo ── */}
            <div className="dashboard-row">

                {/* Distribución horaria */}
                <div className="holo-card" style={{ flex: "1 1 300px" }}>
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <i className="ti ti-chart-bar" style={{ color: "#4cc9f0", fontSize: "1rem" }} />
                            <h2 className="section-title" style={{ margin: 0 }}>Distribución Horaria</h2>
                        </div>
                        <span className="modelos-sub">últimos 7 días</span>
                    </div>
                    <div className="section-divider" />
                    <GraficoHorario datos={distribucion_por_hora} />
                </div>

                {/* Lambda por tipo */}
                <div className="holo-card" style={{ flex: "1 1 260px" }}>
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <i className="ti ti-filter" style={{ color: "#fb923c", fontSize: "1rem" }} />
                            <h2 className="section-title" style={{ margin: 0 }}>λ por Tipo</h2>
                        </div>
                        <span className="modelos-sub">últimas 24h</span>
                    </div>
                    <div className="section-divider" />
                    {!lambda_por_tipo || lambda_por_tipo.length === 0 ? (
                        <p className="empty-state">Sin datos disponibles</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table className="tipo-table">
                                <thead>
                                    <tr>
                                        {["Tipo", "Total 24h", "λ /hora"].map(h => <th key={h}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lambda_por_tipo.map((row, i) => (
                                        <tr key={i}>
                                            <td>
                                                <span className={`tipo-nombre tipo-nombre-${row.tipo === "Deposito" ? "deposito" : row.tipo === "Retiro" ? "retiro" : "transfer"}`}>
                                                    {row.tipo}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="tipo-cantidad-mono">
                                                    {fmtNum(row.total_24h, 0)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="tipo-lambda-cell">
                                                    <span className="tipo-lambda-val">
                                                        {fmtNum(row.lambda_hora, 2)}/h
                                                    </span>
                                                    <BarraProgreso valor={row.lambda_hora} max={maxLambda} color="#4cc9f0" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Calculadoras ── */}
            <div className="dashboard-row">
                <CalculadoraManual />
                <CalculadoraPn />
            </div>

        </div>
    );
}

export default AdminColas;