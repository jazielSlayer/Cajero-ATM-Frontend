// ── Actividad.jsx ─────────────────────────────────────────────────────────────
// Todos los textos estáticos ahora usan t() de i18next.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ImportarNav from "../../Importar nav/importar-nav";
import { getActividadCompleta, exportarActividadCSV } from "../../Api/Api_cliente/Actividad";
import "../../Css/actividad.css";

const C_DEP  = "#4ade80";
const C_RET  = "#f87171";
const C_TRF  = "#60a5fa";
const C_OTR  = "#fbbf24";
const PIE_COLORS = [C_DEP, C_RET, C_TRF, C_OTR, "#a78bfa", "#fb923c"];
const TIPOS = ["Todos", "Deposito", "Retiro", "Transferencia", "Consulta_saldo", "Pago_servicio"];

const fmtMonto = (n) =>
    Number(n || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtFecha = (f) =>
    f ? new Date(f).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMes = (clave) => {
    if (!clave) return "";
    const [anio, mes] = clave.split("-");
    const n = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return `${n[parseInt(mes, 10) - 1]} ${anio}`;
};

const colorTipo = (tipo) => {
    const t = (tipo || "").toLowerCase();
    if (t === "deposito")      return "badge-deposito";
    if (t === "retiro")        return "badge-retiro";
    if (t === "transferencia") return "badge-transferencia";
    return "badge-otro";
};

const descargarCSV = (csv, filename) => {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="tooltip-label">{fmtMes(label) || label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: <strong>Bs. {fmtMonto(p.value)}</strong>
                </p>
            ))}
        </div>
    );
};

// ════════════════════════════════════════════════════════════
function Actividad() {
    const { t } = useTranslation();

    const [datos, setDatos]           = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [exportando, setExportando] = useState(false);
    const [vistaGrafico, setVistaGrafico] = useState("barras");
    const [tabActiva, setTabActiva]   = useState("transacciones");
    const [paginaActual, setPaginaActual] = useState(1);
    const POR_PAGINA = 10;

    const [filtrosPendientes, setFiltrosPendientes] = useState({
        fecha_desde: "", fecha_hasta: "",
        tipo_transaccion: "Todos", palabra_clave: "", numero_cuenta: "",
    });
    const [filtrosAplicados, setFiltrosAplicados] = useState({});

    const nombre_completo = (() => {
        try { return JSON.parse(sessionStorage.getItem("usuario_atm"))?.nombre_completo || null; }
        catch { return null; }
    })();

    const cargarDatos = useCallback(async (f = {}) => {
        setLoading(true); setError(null);
        try {
            setDatos(await getActividadCompleta(nombre_completo, f));
            setPaginaActual(1);
        } catch (e) {
            setError(e.message || "Error al cargar actividad.");
        } finally { setLoading(false); }
    }, [nombre_completo]);

    useEffect(() => {
    if (!nombre_completo) { setError(t("act.sin_sesion")); setLoading(false); return; }
    cargarDatos();
}, [cargarDatos, nombre_completo, t]);


    const aplicarFiltros = () => {
        const f = {};
        if (filtrosPendientes.fecha_desde)                  f.fecha_desde      = filtrosPendientes.fecha_desde;
        if (filtrosPendientes.fecha_hasta)                  f.fecha_hasta      = filtrosPendientes.fecha_hasta;
        if (filtrosPendientes.tipo_transaccion !== "Todos") f.tipo_transaccion = filtrosPendientes.tipo_transaccion;
        if (filtrosPendientes.palabra_clave)                f.palabra_clave    = filtrosPendientes.palabra_clave;
        if (filtrosPendientes.numero_cuenta)                f.numero_cuenta    = filtrosPendientes.numero_cuenta;
        setFiltrosAplicados(f);
        cargarDatos(f);
    };

    const limpiarFiltros = () => {
        const vacio = { fecha_desde: "", fecha_hasta: "", tipo_transaccion: "Todos", palabra_clave: "", numero_cuenta: "" };
        setFiltrosPendientes(vacio);
        setFiltrosAplicados({});
        cargarDatos();
    };

    const handleExportarCSV = async () => {
        setExportando(true);
        try {
            const { csv } = await exportarActividadCSV(nombre_completo, filtrosAplicados);
            csv ? descargarCSV(csv, `actividad_${nombre_completo.replace(/\s/g,"_")}_${Date.now()}.csv`)
                : alert(t("act.sin_datos_exportar"));
        } catch { alert(t("act.error_exportar")); }
        finally { setExportando(false); }
    };

    const handleExportarPDF = async () => {
        if (!datos?.transacciones?.length) return;
        try {
            const { jsPDF } = await import("jspdf");
            const autoTable = (await import("jspdf-autotable")).default;
            const doc = new jsPDF({ orientation: "landscape" });
            doc.setFontSize(16);
            doc.text(`${t("nav.actividad")} — ${datos.usuario.nombre_completo}`, 14, 16);
            doc.setFontSize(9);
            doc.text(`${new Date().toLocaleDateString("es-ES")}`, 14, 22);
            autoTable(doc, {
                startY: 26,
                head: [[
                    t("act.col_id"), t("act.col_fecha"), t("act.col_tipo"),
                    t("act.col_metodo"), t("act.col_monto"), t("act.col_saldo_post"),
                    t("act.col_descripcion"), t("act.col_destinatario"), t("act.col_estado"),
                ]],
                body: datos.transacciones.map((tx) => [
                    tx.transaccion_id, fmtFecha(tx.Fecha_transaccion), tx.tipo_transaccion,
                    tx.Metodo_transaccion, `Bs. ${fmtMonto(tx.Monto)}`,
                    `Bs. ${fmtMonto(tx.Saldo_posterior)}`,
                    tx.Descripcion || "—", tx.nombre_destinatario || "—", tx.estado_transaccion,
                ]),
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [13, 13, 13] },
                alternateRowStyles: { fillColor: [26, 26, 46] },
            });
            doc.save(`actividad_${nombre_completo.replace(/\s/g,"_")}.pdf`);
        } catch { handleExportarCSV(); }
    };

    const transacciones = datos?.transacciones || [];
    const totalPaginas  = Math.ceil(transacciones.length / POR_PAGINA);
    const txPagina      = transacciones.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
    const datosGrafico  = (datos?.actividadMensual || []).map((d) => ({ ...d, label: fmtMes(d.mes) }));
    const cuentasUnicas = [...new Map((datos?.cuentas || []).map((c) => [c.cuenta_id, c])).values()];

    if (loading && !datos) return (
        <div className="actividad">
            <ImportarNav />
            <div className="act-page-loading">
                <div className="act-spinner" />
                <p>{t("act.cargando")}</p>
            </div>
        </div>
    );

    if (error && !datos) return (
        <div className="actividad">
            <ImportarNav />
            <div className="act-page-error">
                <i className="ti ti-alert-circle" style={{ fontSize: "2.5rem" }} />
                <p>{error}</p>
            </div>
        </div>
    );

    const { resumen, notificaciones } = datos || {};
    const hayFiltros = Object.keys(filtrosAplicados).length > 0;

    return (
        <div className="actividad">
            <ImportarNav />

            {/* ── KPI Cards ──────────────────────────────────────────────── */}
            <div className="act-kpis">
                <div className="kpi-card holo-card kpi-deposito">
                    <div className="holo-shine" />
                    <div className="kpi-icon"><i className="ti ti-arrow-down-circle" /></div>
                    <div className="kpi-body">
                        <span className="kpi-label">{t("act.total_depositos")}</span>
                        <span className="kpi-value">Bs. {fmtMonto(resumen?.totalDepositos)}</span>
                    </div>
                </div>
                <div className="kpi-card holo-card kpi-retiro">
                    <div className="holo-shine" />
                    <div className="kpi-icon"><i className="ti ti-arrow-up-circle" /></div>
                    <div className="kpi-body">
                        <span className="kpi-label">{t("act.total_retiros")}</span>
                        <span className="kpi-value">Bs. {fmtMonto(resumen?.totalRetiros)}</span>
                    </div>
                </div>
                <div className="kpi-card holo-card kpi-transferencia">
                    <div className="holo-shine" />
                    <div className="kpi-icon"><i className="ti ti-arrows-exchange" /></div>
                    <div className="kpi-body">
                        <span className="kpi-label">{t("act.transferencias")}</span>
                        <span className="kpi-value">Bs. {fmtMonto(resumen?.totalTransferencias)}</span>
                    </div>
                </div>
                <div className="kpi-card holo-card kpi-balance">
                    <div className="holo-shine" />
                    <div className="kpi-icon"><i className="ti ti-chart-bar" /></div>
                    <div className="kpi-body">
                        <span className="kpi-label">{t("act.balance_neto")}</span>
                        <span className="kpi-value">Bs. {fmtMonto(resumen?.balance)}</span>
                    </div>
                    <div className="act-export-btns" style={{ marginLeft: "auto" }}>
                        <button className="btn-export" onClick={handleExportarCSV} disabled={exportando}>
                            <i className="ti ti-file-text" />
                            {exportando ? t("act.exportando") : t("act.csv")}
                        </button>
                        <button className="btn-export btn-export-pdf" onClick={handleExportarPDF}>
                            <i className="ti ti-file-type-pdf" />{t("act.pdf")}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Notificaciones ─────────────────────────────────────────── */}
            {notificaciones?.length > 0 && (
                <div className="act-notifs">
                    {notificaciones.map((n, i) => (
                        <div key={i} className={`notif-item notif-${n.tipo}`}>
                            <i className={`ti ${n.icono}`} />
                            <div><strong>{n.titulo}</strong><span>{n.mensaje}</span></div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Gráfico ────────────────────────────────────────────────── */}
            <div className="act-chart-section">
                <div className="holo-card chart-inner">
                    <div className="holo-shine" />
                    <div className="card-header-row chart-header">
                        <h2>{t("act.actividad_mensual")}</h2>
                        <div className="chart-tabs">
                            {[
                                ["barras", "ti-chart-bar",   t("act.barras")],
                                ["linea",  "ti-chart-line",  t("act.linea")],
                                ["pie",    "ti-chart-donut", t("act.distribucion")],
                            ].map(([v, ic, lb]) => (
                                <button
                                    key={v}
                                    className={`chart-tab ${vistaGrafico === v ? "active" : ""}`}
                                    onClick={() => setVistaGrafico(v)}
                                >
                                    <i className={`ti ${ic}`} />{lb}
                                </button>
                            ))}
                        </div>
                    </div>

                    {vistaGrafico === "barras" && (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={datosGrafico} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.07)" />
                                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                                <Bar dataKey="depositos"      name={t("act.depositos")}      fill={C_DEP} radius={[4,4,0,0]} />
                                <Bar dataKey="retiros"        name={t("act.retiros")}        fill={C_RET} radius={[4,4,0,0]} />
                                <Bar dataKey="transferencias" name={t("act.transferencias")} fill={C_TRF} radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {vistaGrafico === "linea" && (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={datosGrafico} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.07)" />
                                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                                <Line type="monotone" dataKey="depositos"      name={t("act.depositos")}      stroke={C_DEP} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="retiros"        name={t("act.retiros")}        stroke={C_RET} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="transferencias" name={t("act.transferencias")} stroke={C_TRF} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    {vistaGrafico === "pie" && (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={resumen?.distribucionPorTipo || []}
                                    dataKey="total" nameKey="tipo"
                                    cx="50%" cy="50%" outerRadius={100}
                                    label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {(resumen?.distribucionPorTipo || []).map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => `Bs. ${fmtMonto(v)}`} />
                                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Filtros ────────────────────────────────────────────────── */}
            <div className="act-filters holo-card">
                <div className="holo-shine" />
                <div className="filter-row">
                    <div className="filter-group filter-search">
                        <i className="ti ti-search" />
                        <input
                            type="text"
                            placeholder={t("act.buscar_placeholder")}
                            value={filtrosPendientes.palabra_clave}
                            onChange={(e) => setFiltrosPendientes((p) => ({ ...p, palabra_clave: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
                        />
                    </div>
                    <div className="filter-group">
                        <i className="ti ti-tag" />
                        <select
                            value={filtrosPendientes.tipo_transaccion}
                            onChange={(e) => setFiltrosPendientes((p) => ({ ...p, tipo_transaccion: e.target.value }))}
                        >
                            {TIPOS.map((tp) => (
                                <option key={tp} value={tp}>
                                    {tp === "Todos" ? t("act.todos_tipos") : tp}
                                </option>
                            ))}
                        </select>
                    </div>
                    {cuentasUnicas.length > 1 && (
                        <div className="filter-group">
                            <i className="ti ti-wallet" />
                            <select
                                value={filtrosPendientes.numero_cuenta}
                                onChange={(e) => setFiltrosPendientes((p) => ({ ...p, numero_cuenta: e.target.value }))}
                            >
                                <option value="">{t("act.todas_cuentas")}</option>
                                {cuentasUnicas.map((c) => (
                                    <option key={c.cuenta_id} value={c.Numero_cuenta}>
                                        {c.Numero_cuenta} · {c.Tipo_cuenta}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="filter-group filter-date">
                        <i className="ti ti-calendar" />
                        <input type="date" value={filtrosPendientes.fecha_desde}
                            onChange={(e) => setFiltrosPendientes((p) => ({ ...p, fecha_desde: e.target.value }))} />
                        <span>—</span>
                        <input type="date" value={filtrosPendientes.fecha_hasta}
                            onChange={(e) => setFiltrosPendientes((p) => ({ ...p, fecha_hasta: e.target.value }))} />
                    </div>
                    <button className="btn-filtrar" onClick={aplicarFiltros}>
                        <i className="ti ti-filter" /> {t("act.filtrar")}
                    </button>
                    <button className="btn-limpiar" onClick={limpiarFiltros}>
                        <i className="ti ti-x" /> {t("act.limpiar")}
                    </button>
                </div>

                {hayFiltros && (
                    <div className="filtros-activos">
                        <i className="ti ti-filter-check" />
                        <span>{t("act.filtros_activos", { count: transacciones.length })}</span>
                    </div>
                )}
            </div>

            {/* ── Tabs ───────────────────────────────────────────────────── */}
            <div className="act-tabs">
                <button
                    className={`act-tab ${tabActiva === "transacciones" ? "active" : ""}`}
                    onClick={() => setTabActiva("transacciones")}
                >
                    <i className="ti ti-receipt" /> {t("act.transacciones_tab")}
                    <span className="act-tab-count">{transacciones.length}</span>
                </button>
                <button
                    className={`act-tab ${tabActiva === "cuentas" ? "active" : ""}`}
                    onClick={() => setTabActiva("cuentas")}
                >
                    <i className="ti ti-credit-card" /> {t("act.cuentas_tab")}
                    <span className="act-tab-count">{cuentasUnicas.length}</span>
                </button>
            </div>

            {/* ── Tabla transacciones ────────────────────────────────────── */}
            {tabActiva === "transacciones" && (
                <div className="act-table-section">
                    {loading
                        ? <div className="act-loading-overlay"><div className="act-spinner" /></div>
                        : transacciones.length === 0
                            ? (
                                <div className="act-empty">
                                    <i className="ti ti-inbox" />
                                    <p>{t("act.sin_transacciones")}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="tabla-responsive">
                                        <table className="act-table">
                                            <thead>
                                                <tr>
                                                    
                                                    <th>{t("act.col_fecha")}</th>
                                                    <th>{t("act.col_tipo")}</th>
                                                    <th>{t("act.col_metodo")}</th>
                                                    <th>{t("act.col_monto")}</th>
                                                    <th>{t("act.col_saldo_post")}</th>
                                                    <th>{t("act.col_descripcion")}</th>
                                                    <th>{t("act.col_destinatario")}</th>
                                                    <th>{t("act.col_estado")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {txPagina.map((tx) => (
                                                    <tr key={tx.transaccion_id}>
                                                        
                                                        <td data-label={t("act.col_fecha")}   className="td-fecha">{fmtFecha(tx.Fecha_transaccion)}</td>
                                                        <td data-label={t("act.col_tipo")}>
                                                            <span className={`badge ${colorTipo(tx.tipo_transaccion)}`}>{tx.tipo_transaccion}</span>
                                                        </td>
                                                        <td data-label={t("act.col_metodo")}>{tx.Metodo_transaccion || "—"}</td>
                                                        <td
                                                            data-label={t("act.col_monto")}
                                                            className={(tx.tipo_transaccion||"").toLowerCase() === "deposito" ? "monto-positivo" : "monto-negativo"}
                                                        >
                                                            {(tx.tipo_transaccion||"").toLowerCase() === "deposito" ? "+" : "−"}
                                                            Bs. {fmtMonto(tx.Monto)}
                                                        </td>
                                                        <td data-label={t("act.col_saldo_post")}>Bs. {fmtMonto(tx.Saldo_posterior)}</td>
                                                        <td data-label={t("act.col_descripcion")} className="td-desc">{tx.Descripcion || "—"}</td>
                                                        <td data-label={t("act.col_destinatario")}>{tx.nombre_destinatario || "—"}</td>
                                                        <td data-label={t("act.col_estado")}>
                                                            <span className={`estado-badge estado-${tx.estado_transaccion}`}>{tx.estado_transaccion}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPaginas > 1 && (
                                        <div className="paginacion">
                                            <button disabled={paginaActual === 1} onClick={() => setPaginaActual(1)}>«</button>
                                            <button disabled={paginaActual === 1} onClick={() => setPaginaActual((p) => p - 1)}>‹</button>
                                            {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                                                const pg = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4)) + i;
                                                return (
                                                    <button key={pg} className={paginaActual === pg ? "pg-active" : ""} onClick={() => setPaginaActual(pg)}>
                                                        {pg}
                                                    </button>
                                                );
                                            })}
                                            <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual((p) => p + 1)}>›</button>
                                            <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(totalPaginas)}>»</button>
                                            <span className="pg-info">
                                                {t("act.pg_info", { actual: paginaActual, total: totalPaginas, count: transacciones.length })}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )
                    }
                </div>
            )}

            {/* ── Cuentas vinculadas ─────────────────────────────────────── */}
            {tabActiva === "cuentas" && (
                <div className="act-cuentas">
                    {cuentasUnicas.map((c) => (
                        <div key={c.cuenta_id} className="cuenta-card holo-card">
                            <div className="holo-shine" />
                            {c.Es_principal === 1 && (
                                <span className="cuenta-badge-principal">{t("act.principal")}</span>
                            )}
                            <div className="cuenta-top">
                                <div>
                                    <p className="cuenta-numero">{c.Numero_cuenta}</p>
                                    <p className="cuenta-tipo">
                                        {c.Tipo_cuenta} · {t("act.tipo_cuenta_label")} {c.Orden}
                                    </p>
                                </div>
                                <span className={`estado-cuenta estado-${c.estado_cuenta}`}>{c.estado_cuenta}</span>
                            </div>
                            {c.Numero_tarjeta && (
                                <div className="cuenta-tarjeta">
                                    <i className="ti ti-credit-card" />
                                    <span>•••• {c.Numero_tarjeta.slice(-4)}</span>
                                    <span className="cuenta-tarjeta-tipo">{c.Tipo_tarjeta}</span>
                                    <span className="cuenta-tarjeta-venc">
                                        {t("act.vence")} {fmtFecha(c.Fecha_vencimiento)}
                                    </span>
                                </div>
                            )}
                            <div className="cuenta-saldos">
                                {(c.saldos || []).length === 0
                                    ? <p className="sin-saldo">{t("act.sin_saldo")}</p>
                                    : (c.saldos || []).map((s) => (
                                        <div key={s.Codigo} className="saldo-moneda-row">
                                            <span className="saldo-codigo">{s.Codigo}</span>
                                            <span className="saldo-simbolo">{s.Simbolo}</span>
                                            <span className="saldo-valor">{fmtMonto(s.Saldo)}</span>
                                            <span className="saldo-actualiz">{fmtFecha(s.Fecha_modificacion)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Actividad;