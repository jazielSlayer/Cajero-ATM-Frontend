import { useState } from "react";
import { useTranslation } from "react-i18next";
import "../../Css/Depositar.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { iniciarRetiro, ejecutarRetiro } from "../../Api/Api_cliente/Hacer_Transaccion";
import { IconThumbUpFilled } from "@tabler/icons-react";

// Símbolos y banderas no necesitan traducción
const MONEDAS_META = {
    BOB: { simbolo: "Bs",  bandera: "🇧🇴" },
    USD: { simbolo: "$",   bandera: "🇺🇸" },
    EUR: { simbolo: "€",   bandera: "🇪🇺" },
    BRL: { simbolo: "R$",  bandera: "🇧🇷" },
    ARS: { simbolo: "$",   bandera: "🇦🇷" },
    CLP: { simbolo: "$",   bandera: "🇨🇱" },
    PEN: { simbolo: "S/",  bandera: "🇵🇪" },
    COP: { simbolo: "$",   bandera: "🇨🇴" },
};

const MONEDAS_KEYS = Object.keys(MONEDAS_META);

export default function RetirarDinero() {
    const { t } = useTranslation();

    // Los nombres de moneda se traducen vía t(); el resto (símbolo/bandera)
    // viene de MONEDAS_META para no duplicar datos estáticos.
    const getMeta = (codigo) => ({
        ...(MONEDAS_META[codigo] || { simbolo: "", bandera: "💱" }),
        nombre: t(`dep.mon_${codigo}`, { defaultValue: codigo }),
    });

    // Los pasos del stepper son traducibles y se recalculan con el idioma activo
    const PASOS_LABEL = [
        t("ret.paso_datos"),
        t("ret.paso_moneda"),
        t("ret.paso_confirmar"),
        t("ret.paso_listo"),
    ];

    // ── Estado del formulario ─────────────────────────────────────────────────
    const [fase, setFase]               = useState(0);
    const [tarjeta, setTarjeta]         = useState("");
    const [pin, setPin]                 = useState("");
    const [monto, setMonto]             = useState("");
    const [moneda, setMoneda]           = useState("BOB");
    const [tipoTasa, setTipoTasa]       = useState("oficial");
    const [metodo, setMetodo]           = useState("ATM");

    // ── Respuestas del backend ────────────────────────────────────────────────
    const [opciones, setOpciones]       = useState([]);
    const [monedaSalida, setMonedaSal]  = useState(null);
    const [detalleConv, setDetalleConv] = useState(null);
    const [resultado, setResultado]     = useState(null);

    // ── UI ────────────────────────────────────────────────────────────────────
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");

    const montoNum = parseFloat(monto) || 0;

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 0 → FASE 1
    // ─────────────────────────────────────────────────────────────────────────
    const handleBuscarOpciones = async () => {
        setError("");
        setLoading(true);
        try {
            const resp = await iniciarRetiro({
                numero_tarjeta: tarjeta,
                pin,
                monto:     montoNum,
                moneda,
                tipo_tasa: tipoTasa,
                metodo,
            });
            if (resp.requiere_seleccion_moneda) {
                setOpciones(resp.opciones_disponibles || []);
                setFase(1);
            } else if (resp.transaccionId) {
                setResultado(resp);
                setFase(3);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 1 → FASE 2 / 3
    // ─────────────────────────────────────────────────────────────────────────
    const handleElegirMoneda = async (codigoMoneda) => {
        setMonedaSal(codigoMoneda);
        setError("");
        setLoading(true);
        try {
            const resp = await ejecutarRetiro({
                numero_tarjeta: tarjeta,
                pin,
                monto:          montoNum,
                moneda,
                moneda_salida:  codigoMoneda,
                tipo_tasa:      tipoTasa,
                metodo,
                confirmar_conversion: false,
            });

            if (resp._status === 202 && resp.requiere_confirmacion) {
                setDetalleConv(resp.detalle_conversion);
                setFase(2);
            } else if (resp.transaccionId) {
                setResultado(resp);
                setFase(3);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // FASE 2 → FASE 3
    // ─────────────────────────────────────────────────────────────────────────
    const handleConfirmarConversion = async () => {
        setError("");
        setLoading(true);
        try {
            const resp = await ejecutarRetiro({
                numero_tarjeta: tarjeta,
                pin,
                monto:          montoNum,
                moneda,
                moneda_salida:  monedaSalida,
                tipo_tasa:      tipoTasa,
                metodo,
                confirmar_conversion: true,
            });

            if (resp.transaccionId) {
                setResultado(resp);
                setFase(3);
            } else {
                setError(resp.error || t("ret.error_retiro"));
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    const reiniciar = () => {
        setFase(0); setTarjeta(""); setPin(""); setMonto(""); setMoneda("BOB");
        setTipoTasa("oficial"); setMetodo("ATM"); setOpciones([]);
        setMonedaSal(null); setDetalleConv(null); setResultado(null); setError("");
    };

    const fase0Valida = tarjeta && pin.length >= 4 && montoNum > 0;

    return (
        <div className="contenedor">
            <ImportarNav />

            <div className="dep-container">

                {/* ── Stepper ──────────────────────────────────────────── */}
                {fase < 3 && (
                    <div className="dep-stepper">
                        {PASOS_LABEL.slice(0, 3).map((l, i) => (
                            <div
                                key={l}
                                className={`dep-step ${i <= fase ? "dep-step--active" : ""} ${i < fase ? "dep-step--done" : ""}`}
                            >
                                <div className="dep-step-circle">{i < fase ? "✓" : i + 1}</div>
                                <span className="dep-step-label">{l}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    FASE 0 — Credenciales + monto
                ════════════════════════════════════════════════════════ */}
                {fase === 0 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">{t("ret.f0_titulo")}</h2>

                        <div className="dep-monto-wrap">
                            <div className="dep-monto-input-row">
                                <span className="dep-simbolo">{getMeta(moneda).simbolo}</span>
                                <input
                                    className="dep-monto-input"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                />
                                <select
                                    className="dep-codigo"
                                    value={moneda}
                                    onChange={(e) => setMoneda(e.target.value)}
                                >
                                    {MONEDAS_KEYS.map((k) => (
                                        <option key={k} value={k}>
                                            {getMeta(k).bandera} {k}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="dep-tasa-row">
                            <div className="dep-radio-group">
                                {["oficial", "binance"].map((tasa) => (
                                    <label
                                        key={tasa}
                                        className={`dep-radio ${tipoTasa === tasa ? "dep-radio--sel" : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="tasa"
                                            value={tasa}
                                            checked={tipoTasa === tasa}
                                            onChange={() => setTipoTasa(tasa)}
                                        />
                                        {tasa.charAt(0).toUpperCase() + tasa.slice(1)}
                                    </label>
                                ))}
                            </div>
                            <div className="dep-radio-group">
                                {["ATM", "ventanilla"].map((m) => (
                                    <label
                                        key={m}
                                        className={`dep-radio ${metodo === m ? "dep-radio--sel" : ""}`}
                                    >
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

                        <div className="dep-divider" />

                        <h3 className="dep-card-sub">{t("ret.autenticacion")}</h3>
                        <div className="dep-form-grid">
                            <div className="dep-field">
                                <label className="dep-label">{t("ret.num_tarjeta")}</label>
                                <input
                                    className="dep-input"
                                    type="text"
                                    placeholder="0000000000000000"
                                    value={tarjeta}
                                    onChange={(e) => setTarjeta(e.target.value)}
                                />
                            </div>
                            <div className="dep-field">
                                <label className="dep-label">{t("ret.pin")}</label>
                                <input
                                    className="dep-input dep-input--pin"
                                    type="password"
                                    maxLength={6}
                                    placeholder="••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="dep-error">{error}</div>}

                        <button
                            className="dep-btn-next"
                            onClick={handleBuscarOpciones}
                            disabled={!fase0Valida || loading}
                        >
                            {loading ? <span className="dep-spinner" /> : t("ret.ver_opciones")}
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    FASE 1 — Selección de moneda de salida
                ════════════════════════════════════════════════════════ */}
                {fase === 1 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">{t("ret.f1_titulo")}</h2>
                        <p className="dep-card-sub">
                            {t("ret.f1_sub_inicio")} <strong>{montoNum} {moneda}</strong> — {t("ret.f1_sub_fin")}
                        </p>

                        {error && <div className="dep-error">{error}</div>}

                        <div className="dep-opciones-grid">
                            {opciones.map((op) => {
                                const meta = getMeta(op.moneda);
                                return (
                                    <button
                                        key={op.moneda}
                                        className={`dep-opcion ${!op.suficiente ? "dep-opcion--insuf" : ""}`}
                                        onClick={() => !loading && op.suficiente && handleElegirMoneda(op.moneda)}
                                        disabled={loading || !op.suficiente}
                                        title={!op.suficiente ? t("ret.saldo_insuf_title") : ""}
                                    >
                                        <span className="dep-op-bandera">{meta.bandera}</span>
                                        <span className="dep-op-codigo">{op.moneda}</span>
                                        <span className="dep-op-nombre">{meta.nombre}</span>
                                        <span className="dep-op-recibe">
                                            {t("ret.recibes")}: <strong>{meta.simbolo} {Number(op.monto_a_recibir).toFixed(4)}</strong>
                                        </span>
                                        <span className="dep-op-saldo">
                                            {t("ret.disponible")}: {meta.simbolo} {Number(op.saldo_disponible).toFixed(2)}
                                        </span>
                                        {op.tasa_aplicada !== 1 && (
                                            <span className="dep-op-tasa">{t("dep.tasa_label")}: {op.tasa_aplicada}</span>
                                        )}
                                        {!op.suficiente && (
                                            <span className="dep-op-insuf-badge">{t("ret.sin_saldo")}</span>
                                        )}
                                        {loading && monedaSalida === op.moneda && (
                                            <span className="dep-spinner dep-spinner--sm" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button className="dep-btn-back" onClick={() => { setFase(0); setError(""); }}>
                            {t("ret.cambiar_monto")}
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    FASE 2 — Confirmar conversión desde BOB
                ════════════════════════════════════════════════════════ */}
                {fase === 2 && detalleConv && (
                    <div className="dep-card dep-fade dep-card--success">
                        <div className="dep-success-icon">⚠️</div>
                        <h2 className="dep-card-title">{t("ret.f2_titulo")}</h2>
                        <p className="dep-card-sub">
                            {t("ret.f2_sub_ini")} <strong>{monedaSalida}</strong>. {t("ret.f2_sub_fin")}
                        </p>

                        <div className="dep-conv-tabla">
                            <FilaConv label={t("ret.conv_retiras")}    valor={detalleConv.montoASalida} />
                            <FilaConv label={t("ret.conv_bob")}        valor={detalleConv.bobNecesarios} destacado />
                            <FilaConv label={t("ret.conv_saldo_bob")}  valor={detalleConv.saldoBOBDisponible} />
                            {detalleConv.tasa && (
                                <FilaConv
                                    label={`${t("dep.tasa_label")} ${detalleConv.tasa.tipo}`}
                                    valor={`1 ${monedaSalida} = Bs ${detalleConv.tasa.valor}`}
                                />
                            )}
                        </div>

                        {error && <div className="dep-error">{error}</div>}

                        <div className="dep-btn-row">
                            <button className="dep-btn-back" onClick={() => { setFase(1); setError(""); }}>
                                {t("ret.cambiar_moneda")}
                            </button>
                            <button
                                className="dep-btn-confirm"
                                onClick={handleConfirmarConversion}
                                disabled={loading}
                            >
                                {loading ? <span className="dep-spinner" /> : t("ret.confirmar_retiro")}
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    FASE 3 — Éxito
                ════════════════════════════════════════════════════════ */}
                {fase === 3 && resultado && (
                    <div className="dep-card dep-card--success dep-fade">
                        <h2 className="dep-card-title">{t("ret.exito_titulo")} <IconThumbUpFilled /></h2>
                        <p className="dep-success-msg">{resultado.mensaje}</p>

                        <div className="dep-resumen dep-resumen--success">
                            {resultado.detalle?.montoSolicitado && (
                                <FilaResult label={t("ret.res_solicitado")}   valor={resultado.detalle.montoSolicitado} />
                            )}
                            {resultado.detalle?.montoRetirado && (
                                <FilaResult label={t("ret.res_entregado")}    valor={resultado.detalle.montoRetirado} />
                            )}
                            {resultado.detalle?.bobDescontados && (
                                <FilaResult label={t("ret.res_bob_desc")}     valor={resultado.detalle.bobDescontados} />
                            )}
                            {resultado.detalle?.equivalenteBOB && (
                                <FilaResult label={t("ret.res_equiv_bob")}    valor={resultado.detalle.equivalenteBOB} />
                            )}
                            {resultado.detalle?.tasa && (
                                <FilaResult
                                    label={t("ret.res_tasa")}
                                    valor={`${resultado.detalle.tasa.valor} (${resultado.detalle.tasa.tipo})`}
                                />
                            )}
                        </div>

                        <button className="dep-btn-next" onClick={reiniciar}>
                            {t("ret.otro_retiro")}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

// ── Helpers de filas ──────────────────────────────────────────────────────────
function FilaConv({ label, valor, destacado }) {
    return (
        <div className={`dep-conv-fila ${destacado ? "dep-conv-fila--dest" : ""}`}>
            <span>{label}</span>
            <strong>{valor}</strong>
        </div>
    );
}

function FilaResult({ label, valor }) {
    return (
        <div className="dep-resumen-fila">
            <span>{label}</span>
            <strong>{valor}</strong>
        </div>
    );
}