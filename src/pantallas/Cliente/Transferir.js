import { useState, useEffect } from "react";
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

/* ─── Constantes ──────────────────────────────────────────────────── */
const MONEDAS = [
    { codigo: "BOB", nombre: "Boliviano",      simbolo: "Bs",  bandera: "🇧🇴" },
    { codigo: "USD", nombre: "Dólar",           simbolo: "$",   bandera: "🇺🇸" },
    { codigo: "EUR", nombre: "Euro",            simbolo: "€",   bandera: "🇪🇺" },
    { codigo: "BRL", nombre: "Real brasileño",  simbolo: "R$",  bandera: "🇧🇷" },
    { codigo: "ARS", nombre: "Peso argentino",  simbolo: "$",   bandera: "🇦🇷" },
    { codigo: "CLP", nombre: "Peso chileno",    simbolo: "$",   bandera: "🇨🇱" },
    { codigo: "PEN", nombre: "Sol peruano",     simbolo: "S/",  bandera: "🇵🇪" },
    { codigo: "COP", nombre: "Peso colombiano", simbolo: "$",   bandera: "🇨🇴" },
];

const TIPOS_TRANSFERENCIA = [
    {
        id: "directa",
        label: "Transferencia Directa",
        desc: "Transfiere en la misma moneda",
        icon: <IconBuildingBank />,
    },
    {
        id: "conversion",
        label: "Transferencia con Conversión",
        desc: "Convierte la moneda al transferir",
        icon: <IconCashMove />,
    },
];

const PASOS = ["Tipo", "Cuentas", "Monto", "Seguridad", "Confirmar"];

function getMoneda(codigo) {
    return MONEDAS.find((m) => m.codigo === codigo) || MONEDAS[0];
}

/* ─── Componente principal ────────────────────────────────────────── */
export default function TransferirDinero() {
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

    // Confirmación conversión
    const [requiereConfirm, setRequiereConfirm] = useState(false);
    const [detalleConversion, setDetalleConv]   = useState(null);

    // Sesión
    
    const [loadingSesion, setLoadSesion]  = useState(true);
    const [errorSesion, setErrorSesion]   = useState("");

    // ── Cargar sesión ──────────────────────────────────────────────
    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        if (!sesion) {
            setErrorSesion("No se encontró sesión activa.");
            setLoadSesion(false);
            return;
        }
        const { nombre_completo } = JSON.parse(sesion);
        getDatosUsuario(nombre_completo)
            .then((data) => {
                
                setCuentaOrig(data.usuario.cuenta.numero_cuenta);
            })
            .catch(() => setErrorSesion("Error al cargar datos de sesión."))
            .finally(() => setLoadSesion(false));
    }, []);

    // ── Cargar tasas ───────────────────────────────────────────────
    useEffect(() => {
        setLoadT(true);
        consultarTasas()
            .then((d) => setTasas(d.tasas || []))
            .catch(() => {})
            .finally(() => setLoadT(false));
    }, []);

    // ── Cargar saldos de la cuenta origen ─────────────────────────
    useEffect(() => {
        if (!cuentaOrigen) return;
        consultarSaldos(cuentaOrigen)
            .then((d) => setSaldos(d.saldos || []))
            .catch(() => setSaldos([]));
    }, [cuentaOrigen]);

    // Si transferencia directa → moneda destino = origen
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

    //const saldoBOBDisponible = saldos.find((s) => s.Codigo_moneda === "BOB")?.Saldo ?? 0;
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
                    <p className="loading">Cargando datos de sesión…</p>
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
                        <h2 className="trf-card-title">¿Qué tipo de transferencia deseas realizar?</h2>
                        <div className="trf-tipo-grid">
                            {TIPOS_TRANSFERENCIA.map((t) => (
                                <button
                                    key={t.id}
                                    className={`trf-tipo-btn ${tipoTransf === t.id ? "trf-tipo-btn--sel" : ""}`}
                                    onClick={() => setTipo(t.id)}
                                >
                                    <span className="trf-tipo-icon">{t.icon}</span>
                                    <span className="trf-tipo-label">{t.label}</span>
                                    <span className="trf-tipo-desc">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                        <button className="trf-btn-next" onClick={() => setPaso(1)}>
                            Continuar →
                        </button>
                    </div>
                )}

                {/* PASO 1 — Cuentas */}
                {paso === 1 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">Cuentas de origen y destino</h2>

                        <div className="trf-cuentas-grid">
                            <div className="trf-field">
                                <label className="trf-label">Cuenta origen</label>
                                <input
                                    className="trf-input trf-input--readonly"
                                    type="text"
                                    value={cuentaOrigen}
                                    readOnly
                                />
                                <span className="trf-field-hint">Tu cuenta activa</span>
                            </div>

                            <div className="trf-arrow-center">
                                <IconArrowRight size={28} />
                            </div>

                            <div className="trf-field">
                                <label className="trf-label">Cuenta destino</label>
                                <input
                                    className="trf-input"
                                    type="text"
                                    placeholder="Número de cuenta destino"
                                    value={cuentaDestino}
                                    onChange={(e) => setCuentaDest(e.target.value.trim())}
                                />
                            </div>
                        </div>

                        <div className="trf-field" style={{ marginTop: "1.25rem" }}>
                            <label className="trf-label">Descripción (opcional)</label>
                            <input
                                className="trf-input"
                                type="text"
                                placeholder="Ej: Pago de deuda, alquiler…"
                                value={descripcion}
                                maxLength={255}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>

                        <div className="trf-btn-row">
                            <button className="trf-btn-back" onClick={() => setPaso(0)}>← Atrás</button>
                            <button
                                className="trf-btn-next"
                                onClick={() => setPaso(2)}
                                disabled={!cuentaDestino || cuentaDestino === cuentaOrigen}
                            >
                                Continuar →
                            </button>
                        </div>

                        {cuentaDestino && cuentaDestino === cuentaOrigen && (
                            <p className="trf-warn">La cuenta origen y destino no pueden ser la misma.</p>
                        )}
                    </div>
                )}

                {/* PASO 2 — Monto y monedas */}
                {paso === 2 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">Monto y moneda</h2>

                        <div className="trf-moneda-row">
                            <div className="trf-moneda-col">
                                <label className="trf-label">Moneda a debitar</label>
                                <div className="trf-select-wrap">
                                    <select
                                        className="trf-select"
                                        value={monedaOrigen}
                                        onChange={(e) => setMonedaOrig(e.target.value)}
                                    >
                                        {MONEDAS.map((m) => (
                                            <option key={m.codigo} value={m.codigo}>
                                                {m.bandera} {m.codigo} — {m.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {saldoOrigenDisponible > 0 && (
                                    <span className="trf-saldo-hint">
                                        Disponible: {getMoneda(monedaOrigen).simbolo} {parseFloat(saldoOrigenDisponible).toFixed(2)} {monedaOrigen}
                                    </span>
                                )}
                            </div>

                            {tipoTransf === "conversion" && (
                                <>
                                    <div className="trf-arrow">→</div>
                                    <div className="trf-moneda-col">
                                        <label className="trf-label">Moneda a acreditar</label>
                                        <div className="trf-select-wrap">
                                            <select
                                                className="trf-select"
                                                value={monedaDest}
                                                onChange={(e) => setMonedaDest(e.target.value)}
                                            >
                                                {MONEDAS.map((m) => (
                                                    <option key={m.codigo} value={m.codigo}>
                                                        {m.bandera} {m.codigo} — {m.nombre}
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
                                <span className="trf-label">Tipo de tasa</span>
                                <div className="trf-radio-group">
                                    {["oficial", "binance"].map((t) => (
                                        <label key={t} className={`trf-radio ${tipoTasa === t ? "trf-radio--sel" : ""}`}>
                                            <input
                                                type="radio"
                                                name="tasa"
                                                value={t}
                                                checked={tipoTasa === t}
                                                onChange={() => setTipoTasa(t)}
                                            />
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="trf-tasa-row">
                            <span className="trf-label">Método</span>
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
                            <label className="trf-label">Monto a transferir</label>
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
                                        El destinatario recibirá{" "}
                                        <strong>
                                            {getMoneda(monedaOrigen).simbolo} {montoNum.toFixed(2)} {monedaOrigen}
                                        </strong>.
                                    </p>
                                ) : (
                                    <>
                                        {loadingTasas ? (
                                            <p className="trf-preview-loading">Cargando tasas…</p>
                                        ) : (
                                            <>
                                                <div className="trf-preview-row">
                                                    <span>Equivalente en BOB</span>
                                                    <strong>Bs {montoBOB.toFixed(2)}</strong>
                                                </div>
                                                <div className="trf-preview-row">
                                                    <span>Recibirá en {monedaDest}</span>
                                                    <strong>
                                                        {getMoneda(monedaDest).simbolo}{" "}
                                                        {montoAcreditado.toFixed(6)} {monedaDest}
                                                    </strong>
                                                </div>
                                                {tasaRef && (
                                                    <div className="trf-preview-tasa">
                                                        Tasa {tipoTasa}: 1 {monedaOrigen} = Bs {tasaRef.Tasa}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="trf-btn-row">
                            <button className="trf-btn-back" onClick={() => setPaso(1)}>← Atrás</button>
                            <button
                                className="trf-btn-next"
                                onClick={() => setPaso(3)}
                                disabled={!monto || montoNum <= 0}
                            >
                                Continuar →
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 3 — Seguridad (solo info, la transferencia no pide pin/pass) */}
                {paso === 3 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">Verifica los datos</h2>
                        <p className="trf-card-sub">Revisa que los datos sean correctos antes de continuar</p>

                        <div className="trf-sesion-info">
                            <div className="trf-sesion-fila">
                                <span className="trf-label">Cuenta origen</span>
                                <span className="trf-sesion-valor">{cuentaOrigen}</span>
                            </div>
                            <div className="trf-sesion-fila">
                                <span className="trf-label">Cuenta destino</span>
                                <span className="trf-sesion-valor">{cuentaDestino}</span>
                            </div>
                            <div className="trf-sesion-fila">
                                <span className="trf-label">Monto</span>
                                <span className="trf-sesion-valor">
                                    {getMoneda(monedaOrigen).simbolo} {montoNum.toFixed(2)} {monedaOrigen}
                                </span>
                            </div>
                        </div>

                        <div className="trf-btn-row">
                            <button className="trf-btn-back" onClick={() => setPaso(2)}>← Atrás</button>
                            <button className="trf-btn-next" onClick={() => setPaso(4)}>
                                Continuar →
                            </button>
                        </div>
                    </div>
                )}

                {/* PASO 4 — Confirmar */}
                {paso === 4 && (
                    <div className="trf-card trf-fade">
                        <h2 className="trf-card-title">Resumen de la transferencia</h2>

                        <div className="trf-resumen">
                            <ResumenFila label="Tipo"            valor={tipoTransf === "directa" ? "Transferencia directa" : "Con conversión"} />
                            <ResumenFila label="Cuenta origen"   valor={cuentaOrigen} />
                            <ResumenFila label="Cuenta destino"  valor={cuentaDestino} />
                            <ResumenFila label="Monto a debitar" valor={`${getMoneda(monedaOrigen).simbolo} ${montoNum.toFixed(2)} ${monedaOrigen}`} />
                            <ResumenFila
                                label="Monto a acreditar"
                                valor={`${getMoneda(monedaDest).simbolo} ${montoAcreditado.toFixed(tipoTransf === "directa" ? 2 : 6)} ${monedaDest}`}
                            />
                            {tipoTransf === "conversion" && montoBOB > 0 && (
                                <ResumenFila label="Equivalente BOB" valor={`Bs ${montoBOB.toFixed(2)}`} />
                            )}
                            {tipoTransf === "conversion" && tasaRef && (
                                <ResumenFila label={`Tasa ${tipoTasa}`} valor={`1 ${monedaOrigen} = Bs ${tasaRef.Tasa}`} />
                            )}
                            <ResumenFila label="Método" valor={metodo} />
                            {descripcion && <ResumenFila label="Descripción" valor={descripcion} />}
                        </div>

                        {/* Confirmación de conversión desde BOB */}
                        {requiereConfirm && detalleConversion && (
                            <div className="trf-confirm-box">
                                <div className="trf-confirm-icon"><IconAlertCircle size={22} /></div>
                                <p className="trf-confirm-msg">{`Sin saldo en ${monedaOrigen}. Se usarán ${detalleConversion.montoBOBNecesario} desde tu saldo en BOB.`}</p>
                                <div className="trf-confirm-detalle">
                                    <span>BOB necesarios: <strong>{detalleConversion.montoBOBNecesario}</strong></span>
                                    <span>BOB disponibles: <strong>{detalleConversion.saldoBOBDisponible}</strong></span>
                                    <span>El destino recibirá: <strong>{detalleConversion.montoAcreditaDestino}</strong></span>
                                </div>
                                <button
                                    className="trf-btn-confirm"
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading}
                                >
                                    {loading ? "Procesando…" : "✓ Confirmar con conversión BOB"}
                                </button>
                            </div>
                        )}

                        {error && <div className="trf-error">{error}</div>}

                        {!requiereConfirm && (
                            <div className="trf-btn-row">
                                <button className="trf-btn-back" onClick={() => setPaso(3)}>← Atrás</button>
                                <button
                                    className="trf-btn-confirm"
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                >
                                    {loading ? "Procesando…" : "✓ Confirmar transferencia"}
                                </button>
                            </div>
                        )}

                        {requiereConfirm && (
                            <div className="trf-btn-row" style={{ marginTop: "0.75rem" }}>
                                <button className="trf-btn-back" onClick={() => { setRequiereConfirm(false); setDetalleConv(null); }}>
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 5 — Éxito */}
                {paso === 5 && resultado && (
                    <div className="trf-card trf-card--success trf-fade">
                        <h2 className="trf-card-title">¡Transferencia exitosa! <IconThumbUpFilled /></h2>
                        <p className="trf-success-msg">{resultado.mensaje}</p>

                        <div className="trf-resumen trf-resumen--success">
                            <ResumenFila label="Monto debitado"   valor={resultado.detalle?.montoDebitado} />
                            <ResumenFila label="Monto acreditado" valor={resultado.detalle?.montoAcreditado} />
                            {resultado.detalle?.equivalenteBOB && (
                                <ResumenFila label="Equivalente BOB" valor={resultado.detalle.equivalenteBOB} />
                            )}
                            {resultado.detalle?.tasa && (
                                <ResumenFila
                                    label="Tasa aplicada"
                                    valor={`${resultado.detalle.tasa.origen_a_BOB} (${resultado.detalle.tasa.tipo})`}
                                />
                            )}
                        </div>

                        <button className="trf-btn-next" onClick={reiniciar}>
                            Hacer otra transferencia
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