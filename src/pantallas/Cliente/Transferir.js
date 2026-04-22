import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../Css/Transferir.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { realizarTransferencia, consultarTasas, consultarSaldos } from "../../Api/Api_cliente/Transferir";
import { getDatosUsuario } from "../../Api/Api_cliente/Datos_cliente";
import {
    IconArrowRight,
    IconBuildingBank,
    IconThumbUpFilled,
    IconAlertCircle,
    IconCashMove
} from "@tabler/icons-react";

/* ─── Constantes de monedas ───────────────────────────────────────── */
const MONEDAS = [
    { codigo: "BOB", simbolo: "Bs",  bandera: "🇧🇴" },
    { codigo: "USD", simbolo: "$",   bandera: "🇺🇸" },
    { codigo: "EUR", simbolo: "€",   bandera: "🇪🇺" },
    { codigo: "BRL", simbolo: "R$",  bandera: "🇧🇷" },
    { codigo: "ARS", simbolo: "$",   bandera: "🇦🇷" },
    { codigo: "CLP", simbolo: "$",   bandera: "🇨🇱" },
    { codigo: "PEN", simbolo: "S/",  bandera: "🇵🇪" },
    { codigo: "COP", simbolo: "$",   bandera: "🇨🇴" },
];

function getMoneda(codigo) {
    return MONEDAS.find((m) => m.codigo === codigo) || MONEDAS[0];
}

/* ─── Componente principal ────────────────────────────────────────── */
export default function TransferirDinero() {
    const { t } = useTranslation();

    /* Nombres de monedas traducidos */
    const NOMBRES_MONEDA = {
        BOB: t("trf.mon_BOB"),
        USD: t("trf.mon_USD"),
        EUR: t("trf.mon_EUR"),
        BRL: t("trf.mon_BRL"),
        ARS: t("trf.mon_ARS"),
        CLP: t("trf.mon_CLP"),
        PEN: t("trf.mon_PEN"),
        COP: t("trf.mon_COP"),
    };

    const TIPOS_TRANSFERENCIA = [
        {
            id: "directa",
            label: t("trf.tipo_directa"),
            desc: t("trf.tipo_directa_desc"),
            icon: <IconBuildingBank />,
        },
        {
            id: "conversion",
            label: t("trf.tipo_conversion"),
            desc: t("trf.tipo_conversion_desc"),
            icon: <IconCashMove />,
        },
    ];

    const PASOS = [
        t("trf.paso_tipo"),
        t("trf.paso_cuentas"),
        t("trf.paso_monto"),
        t("trf.paso_seguridad"),
        t("trf.paso_confirmar"),
    ];

    const [paso, setPaso]               = useState(0);
    const [tipoTransf, setTipo]         = useState("directa");
    const [cuentaOrigen, setCuentaOrig] = useState("");
    const [cuentaDestino, setCuentaDest] = useState("");
    const [monedaOrigen, setMonedaOrig] = useState("BOB");
    const [monedaDest, setMonedaDest]   = useState("BOB");
    const [tipoTasa, setTipoTasa]       = useState("oficial");
    const [metodo, setMetodo]           = useState("ATM");
    const [monto, setMonto]             = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [tasas, setTasas]             = useState([]);
    const [loadingTasas, setLoadT]      = useState(false);
    const [saldos, setSaldos]           = useState([]);
    const [loading, setLoading]         = useState(false);
    const [resultado, setResultado]     = useState(null);
    const [error, setError]             = useState("");

    const [requiereConfirm, setRequiereConfirm] = useState(false);
    const [detalleConversion, setDetalleConv]   = useState(null);

    const [loadingSesion, setLoadSesion]  = useState(true);
    const [errorSesion, setErrorSesion]   = useState("");

    // ── Cargar sesión ──────────────────────────────────────────────
    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        if (!sesion) {
            setErrorSesion(t("trf.sin_sesion"));
            setLoadSesion(false);
            return;
        }
        const { nombre_completo } = JSON.parse(sesion);
        getDatosUsuario(nombre_completo)
            .then((data) => {
                setCuentaOrig(data.usuario.cuenta.numero_cuenta);
            })
            .catch(() => setErrorSesion(t("trf.error_sesion")))
            .finally(() => setLoadSesion(false));
    }, [t]);

    // ── Cargar tasas ───────────────────────────────────────────────
    useEffect(() => {
        setLoadT(true);
        consultarTasas()
            .then((d) => setTasas(d.tasas || []))
            .catch(() => {})
            .finally(() => setLoadT(false));
    }, []);

    // ── Cargar saldos ──────────────────────────────────────────────
    useEffect(() => {
        if (!cuentaOrigen) return;
        consultarSaldos(cuentaOrigen)
            .then((d) => setSaldos(d.saldos || []))
            .catch(() => setSaldos([]));
    }, [cuentaOrigen]);

    // Transferencia directa → moneda destino = origen
    useEffect(() => {
        if (tipoTransf === "directa") setMonedaDest(monedaOrigen);
    }, [tipoTransf, monedaOrigen]);

    /* ── Cálculos ───────────────────────────────────────────────── */
    const montoNum = parseFloat(monto) || 0;

    const tasaRef = tasas.find(
        (t) =>
            t.Moneda_origen  === monedaOrigen &&
            t.Moneda_destino === "BOB" &&
            t.Tipo_tasa      === tipoTasa
    );
    const tasaDestRef = tasas.find(
        (t) =>
            t.Moneda_origen  === monedaDest &&
            t.Moneda_destino === "BOB" &&
            t.Tipo_tasa      === tipoTasa
    );

    const montoBOB = monedaOrigen === "BOB" ? montoNum : montoNum * (tasaRef?.Tasa || 0);
    const montoAcreditado =
        tipoTransf === "directa"
            ? montoNum
            : monedaDest === "BOB"
            ? montoBOB
            : montoBOB / (tasaDestRef?.Tasa || 1);

    const saldoOrigenDisponible = saldos.find((s) => s.Codigo_moneda === monedaOrigen)?.Saldo ?? 0;

    /* ── Submit ─────────────────────────────────────────────────── */
    const handleSubmit = async (confirmar = false) => {
        setError("");
        setLoading(true);
        try {
            const resp = await realizarTransferencia({
                numero_de_cuenta:      cuentaOrigen,
                numero_cuenta_destino: cuentaDestino,
                monto:                 montoNum,
                metodo,
                descripcion:           descripcion || undefined,
                moneda_origen:         monedaOrigen,
                moneda_destino:        monedaDest,
                tipo_tasa:             tipoTasa,
                confirmar_conversion:  confirmar,
            });

            if (resp._status === 202 && resp.requiere_confirmacion) {
                setRequiereConfirm(true);
                setDetalleConv(resp.detalle_conversion);
                return;
            }

            if (resp._status === 200 || resp.transaccionId) {
                setResultado(resp);
                setPaso(5);
                setRequiereConfirm(false);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const reiniciar = () => {
        setPaso(0); setTipo("directa"); setMonedaOrig("BOB"); setMonedaDest("BOB");
        setTipoTasa("oficial"); setMetodo("ATM"); setMonto(""); setDescripcion("");
        setCuentaDest(""); setResultado(null); setError("");
        setRequiereConfirm(false); setDetalleConv(null);
    };

    /* ── Renders condicionales ──────────────────────────────────── */
    if (loadingSesion) {
        return (
            <div className="contenedor">
                <ImportarNav />
                <div className="trf-container">
                    <p className="loading">{t("trf.cargando_sesion")}</p>
                </div>
            </div>
        );
    }

    if (errorSesion) {
        return (
            <div className="contenedor">
                <ImportarNav />
                <div className="trf-container">
                    <p className="trf-error">{errorSesion}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor">
            <ImportarNav />

            <div className="trf-container">

                {/* Stepper */}
                {paso < 5 && (
                    <div className="trf-stepper">
                        {PASOS.map((s, i) => (
                            <div
                                key={s}
                                className={`trf-step ${i <= paso ? "trf-step--active" : ""} ${i < paso ? "trf-step--done" : ""}`}
                            >
                                <div className="trf-step-circle">{i < paso ? "✓" : i + 1}</div>
                                <span className="trf-step-label">{s}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* PASO 0 — Tipo */}
                {paso === 0 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">{t("trf.p0_titulo")}</h2>
                        <div className="trf-tipo-grid">
                            {TIPOS_TRANSFERENCIA.map((tp) => (
                                <button
                                    key={tp.id}
                                    className={`trf-tipo-btn ${tipoTransf === tp.id ? "trf-tipo-btn--sel" : ""}`}
                                    onClick={() => setTipo(tp.id)}
                                >
                                    <span className="trf-tipo-icon">{tp.icon}</span>
                                    <span className="trf-tipo-label">{tp.label}</span>
                                    <span className="trf-tipo-desc">{tp.desc}</span>
                                </button>
                            ))}
                        </div>
                        <button className="trf-btn-next" onClick={() => setPaso(1)}>
                            {t("trf.continuar")}
                        </button>
                    </div>
                )}

                {/* PASO 1 — Cuentas */}
                {paso === 1 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">{t("trf.p1_titulo")}</h2>

                        <div className="trf-cuentas-grid">
                            <div className="trf-field">
                                <label className="trf-label">{t("trf.cuenta_origen")}</label>
                                <input
                                    className="trf-input trf-input--readonly"
                                    type="text"
                                    value={cuentaOrigen}
                                    readOnly
                                />
                                <span className="trf-field-hint">{t("trf.cuenta_origen_hint")}</span>
                            </div>

                            <div className="trf-arrow-center">
                                <IconArrowRight size={28} />
                            </div>

                            <div className="trf-field">
                                <label className="trf-label">{t("trf.cuenta_destino")}</label>
                                <input
                                    className="trf-input"
                                    type="text"
                                    placeholder={t("trf.cuenta_destino_placeholder")}
                                    value={cuentaDestino}
                                    onChange={(e) => setCuentaDest(e.target.value.trim())}
                                />
                            </div>
                        </div>

                        <div className="trf-field" style={{ marginTop: "1.25rem" }}>
                            <label className="trf-label">{t("trf.descripcion")}</label>
                            <input
                                className="trf-input"
                                type="text"
                                placeholder={t("trf.descripcion_placeholder")}
                                value={descripcion}
                                maxLength={255}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>

                        <div className="trf-btn-row">
                            <button className="trf-btn-back" onClick={() => setPaso(0)}>{t("trf.atras")}</button>
                            <button
                                className="trf-btn-next"
                                onClick={() => setPaso(2)}
                                disabled={!cuentaDestino || cuentaDestino === cuentaOrigen}
                            >
                                {t("trf.continuar")}
                            </button>
                        </div>

                        {cuentaDestino && cuentaDestino === cuentaOrigen && (
                            <p className="trf-warn">{t("trf.misma_cuenta_warn")}</p>
                        )}
                    </div>
                )}

                {/* PASO 2 — Monto y monedas */}
                {paso === 2 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">{t("trf.p2_titulo")}</h2>

                        <div className="trf-moneda-row">
                            <div className="trf-moneda-col">
                                <label className="trf-label">{t("trf.moneda_debitar")}</label>
                                <div className="trf-select-wrap">
                                    <select
                                        className="trf-select"
                                        value={monedaOrigen}
                                        onChange={(e) => setMonedaOrig(e.target.value)}
                                    >
                                        {MONEDAS.map((m) => (
                                            <option key={m.codigo} value={m.codigo}>
                                                {m.bandera} {m.codigo} — {NOMBRES_MONEDA[m.codigo]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {saldoOrigenDisponible > 0 && (
                                    <span className="trf-saldo-hint">
                                        {t("trf.disponible")}: {getMoneda(monedaOrigen).simbolo} {parseFloat(saldoOrigenDisponible).toFixed(2)} {monedaOrigen}
                                    </span>
                                )}
                            </div>

                            {tipoTransf === "conversion" && (
                                <>
                                    <div className="trf-arrow">→</div>
                                    <div className="trf-moneda-col">
                                        <label className="trf-label">{t("trf.moneda_acreditar")}</label>
                                        <div className="trf-select-wrap">
                                            <select
                                                className="trf-select"
                                                value={monedaDest}
                                                onChange={(e) => setMonedaDest(e.target.value)}
                                            >
                                                {MONEDAS.map((m) => (
                                                    <option key={m.codigo} value={m.codigo}>
                                                        {m.bandera} {m.codigo} — {NOMBRES_MONEDA[m.codigo]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {tipoTransf === "conversion" && (monedaOrigen !== "BOB" || monedaDest !== "BOB") && (
                            <div className="trf-tasa-row">
                                <span className="trf-label">{t("trf.tipo_tasa")}</span>
                                <div className="trf-radio-group">
                                    {["oficial", "binance"].map((tp) => (
                                        <label key={tp} className={`trf-radio ${tipoTasa === tp ? "trf-radio--sel" : ""}`}>
                                            <input
                                                type="radio"
                                                name="tasa"
                                                value={tp}
                                                checked={tipoTasa === tp}
                                                onChange={() => setTipoTasa(tp)}
                                            />
                                            {tp.charAt(0).toUpperCase() + tp.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="trf-tasa-row">
                            <span className="trf-label">{t("trf.metodo")}</span>
                            <div className="trf-radio-group">
                                {["ATM", "web", "app_movil"].map((m) => (
                                    <label key={m} className={`trf-radio ${metodo === m ? "trf-radio--sel" : ""}`}>
                                        <input
                                            type="radio"
                                            name="metodo"
                                            value={m}
                                            checked={metodo === m}
                                            onChange={() => setMetodo(m)}
                                        />
                                        {m}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="trf-monto-wrap">
                            <label className="trf-label">{t("trf.monto_label")}</label>
                            <div className="trf-monto-input-row">
                                <span className="trf-simbolo">{getMoneda(monedaOrigen).simbolo}</span>
                                <input
                                    className="trf-monto-input"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                />
                                <span className="trf-codigo">{monedaOrigen}</span>
                            </div>
                        </div>

                        {montoNum > 0 && (
                            <div className="trf-preview">
                                {tipoTransf === "directa" ? (
                                    <p>
                                        {t("trf.preview_recibira")}{" "}
                                        <strong>
                                            {getMoneda(monedaOrigen).simbolo} {montoNum.toFixed(2)} {monedaOrigen}
                                        </strong>.
                                    </p>
                                ) : (
                                    <>
                                        {loadingTasas ? (
                                            <p className="trf-preview-loading">{t("trf.cargando_tasas")}</p>
                                        ) : (
                                            <>
                                                <div className="trf-preview-row">
                                                    <span>{t("trf.equiv_bob")}</span>
                                                    <strong>Bs {montoBOB.toFixed(2)}</strong>
                                                </div>
                                                <div className="trf-preview-row">
                                                    <span>{t("trf.recibira_en")} {monedaDest}</span>
                                                    <strong>
                                                        {getMoneda(monedaDest).simbolo}{" "}
                                                        {montoAcreditado.toFixed(6)} {monedaDest}
                                                    </strong>
                                                </div>
                                                {tasaRef && (
                                                    <div className="trf-preview-tasa">
                                                        {t("trf.tasa_label")} {tipoTasa}: 1 {monedaOrigen} = Bs {tasaRef.Tasa}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="trf-btn-row">
                            <button className="trf-btn-back" onClick={() => setPaso(1)}>{t("trf.atras")}</button>
                            <button
                                className="trf-btn-next"
                                onClick={() => setPaso(3)}
                                disabled={!monto || montoNum <= 0}
                            >
                                {t("trf.continuar")}
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 3 — Verificar */}
                {paso === 3 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">{t("trf.p3_titulo")}</h2>
                        <p className="trf-card-sub">{t("trf.p3_sub")}</p>

                        <div className="trf-sesion-info">
                            <div className="trf-sesion-fila">
                                <span className="trf-label">{t("trf.cuenta_origen")}</span>
                                <span className="trf-sesion-valor">{cuentaOrigen}</span>
                            </div>
                            <div className="trf-sesion-fila">
                                <span className="trf-label">{t("trf.cuenta_destino")}</span>
                                <span className="trf-sesion-valor">{cuentaDestino}</span>
                            </div>
                            <div className="trf-sesion-fila">
                                <span className="trf-label">{t("trf.monto_label")}</span>
                                <span className="trf-sesion-valor">
                                    {getMoneda(monedaOrigen).simbolo} {montoNum.toFixed(2)} {monedaOrigen}
                                </span>
                            </div>
                        </div>

                        <div className="trf-btn-row">
                            <button className="trf-btn-back" onClick={() => setPaso(2)}>{t("trf.atras")}</button>
                            <button className="trf-btn-next" onClick={() => setPaso(4)}>
                                {t("trf.continuar")}
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 4 — Confirmar */}
                {paso === 4 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">{t("trf.p4_titulo")}</h2>

                        <div className="trf-resumen">
                            <ResumenFila label={t("trf.res_tipo")}          valor={tipoTransf === "directa" ? t("trf.tipo_directa") : t("trf.tipo_conversion")} />
                            <ResumenFila label={t("trf.cuenta_origen")}     valor={cuentaOrigen} />
                            <ResumenFila label={t("trf.cuenta_destino")}    valor={cuentaDestino} />
                            <ResumenFila label={t("trf.res_debitar")}       valor={`${getMoneda(monedaOrigen).simbolo} ${montoNum.toFixed(2)} ${monedaOrigen}`} />
                            <ResumenFila
                                label={t("trf.res_acreditar")}
                                valor={`${getMoneda(monedaDest).simbolo} ${montoAcreditado.toFixed(tipoTransf === "directa" ? 2 : 6)} ${monedaDest}`}
                            />
                            {tipoTransf === "conversion" && montoBOB > 0 && (
                                <ResumenFila label={t("trf.equiv_bob")} valor={`Bs ${montoBOB.toFixed(2)}`} />
                            )}
                            {tipoTransf === "conversion" && tasaRef && (
                                <ResumenFila label={`${t("trf.tasa_label")} ${tipoTasa}`} valor={`1 ${monedaOrigen} = Bs ${tasaRef.Tasa}`} />
                            )}
                            <ResumenFila label={t("trf.metodo")} valor={metodo} />
                            {descripcion && <ResumenFila label={t("trf.descripcion")} valor={descripcion} />}
                        </div>

                        {/* Confirmación de conversión desde BOB */}
                        {requiereConfirm && detalleConversion && (
                            <div className="trf-confirm-box">
                                <div className="trf-confirm-icon"><IconAlertCircle size={22} /></div>
                                <p className="trf-confirm-msg">
                                    {t("trf.sin_saldo_moneda", { moneda: monedaOrigen, monto: detalleConversion.montoBOBNecesario })}
                                </p>
                                <div className="trf-confirm-detalle">
                                    <span>{t("trf.bob_necesarios")}: <strong>{detalleConversion.montoBOBNecesario}</strong></span>
                                    <span>{t("trf.bob_disponibles")}: <strong>{detalleConversion.saldoBOBDisponible}</strong></span>
                                    <span>{t("trf.destino_recibira")}: <strong>{detalleConversion.montoAcreditaDestino}</strong></span>
                                </div>
                                <button
                                    className="trf-btn-confirm"
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                >
                                    {loading ? t("trf.procesando") : t("trf.confirmar_conversion")}
                                </button>
                            </div>
                        )}

                        {error && <div className="trf-error">{error}</div>}

                        {!requiereConfirm && (
                            <div className="trf-btn-row">
                                <button className="trf-btn-back" onClick={() => setPaso(3)}>{t("trf.atras")}</button>
                                <button
                                    className="trf-btn-confirm"
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                >
                                    {loading ? t("trf.procesando") : t("trf.confirmar")}
                                </button>
                            </div>
                        )}

                        {requiereConfirm && (
                            <div className="trf-btn-row" style={{ marginTop: "0.75rem" }}>
                                <button className="trf-btn-back" onClick={() => { setRequiereConfirm(false); setDetalleConv(null); }}>
                                    {t("trf.cancelar")}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 5 — Éxito */}
                {paso === 5 && resultado && (
                    <div className="trf-card trf-card--success trf-fade">
                        <h2 className="trf-card-title">{t("trf.exito_titulo")} <IconThumbUpFilled /></h2>
                        <p className="trf-success-msg">{resultado.mensaje}</p>

                        <div className="trf-resumen trf-resumen--success">
                            <ResumenFila label={t("trf.exito_debitado")}   valor={resultado.detalle?.montoDebitado} />
                            <ResumenFila label={t("trf.exito_acreditado")} valor={resultado.detalle?.montoAcreditado} />
                            {resultado.detalle?.equivalenteBOB && (
                                <ResumenFila label={t("trf.equiv_bob")} valor={resultado.detalle.equivalenteBOB} />
                            )}
                            {resultado.detalle?.tasa && (
                                <ResumenFila
                                    label={t("trf.exito_tasa")}
                                    valor={`${resultado.detalle.tasa.origen_a_BOB} (${resultado.detalle.tasa.tipo})`}
                                />
                            )}
                        </div>

                        <button className="trf-btn-next" onClick={reiniciar}>
                            {t("trf.otra_transferencia")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResumenFila({ label, valor }) {
    return (
        <div className="trf-resumen-fila">
            <span className="trf-resumen-label">{label}</span>
            <span className="trf-resumen-valor">{valor}</span>
        </div>
    );
}