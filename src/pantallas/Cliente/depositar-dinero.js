import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../Css/Depositar.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { realizarDeposito, consultarTasas } from "../../Api/Api_cliente/Hacer_Transaccion";
import { getDatosUsuario } from "../../Api/Api_cliente/Datos_cliente";
import { IconExchange, IconReportMoneyFilled, IconThumbUpFilled } from "@tabler/icons-react";

// Las listas que contienen texto traducible se generan como funciones
// para que reaccionen al cambio de idioma en tiempo de ejecución.
const getMonedas = (t) => [
    { codigo: "BOB", nombre: t("dep.mon_BOB"), simbolo: "Bs",  bandera: "🇧🇴" },
    { codigo: "USD", nombre: t("dep.mon_USD"), simbolo: "$",   bandera: "🇺🇸" },
    { codigo: "EUR", nombre: t("dep.mon_EUR"), simbolo: "€",   bandera: "🇪🇺" },
    { codigo: "BRL", nombre: t("dep.mon_BRL"), simbolo: "R$",  bandera: "🇧🇷" },
    { codigo: "ARS", nombre: t("dep.mon_ARS"), simbolo: "$",   bandera: "🇦🇷" },
    { codigo: "CLP", nombre: t("dep.mon_CLP"), simbolo: "$",   bandera: "🇨🇱" },
    { codigo: "PEN", nombre: t("dep.mon_PEN"), simbolo: "S/",  bandera: "🇵🇪" },
    { codigo: "COP", nombre: t("dep.mon_COP"), simbolo: "$",   bandera: "🇨🇴" },
];

const getTiposDeposito = (t) => [
    {
        id: "directo",
        label: t("dep.tipo_directo"),
        desc:  t("dep.tipo_directo_desc"),
        icon:  <IconReportMoneyFilled />,
    },
    {
        id: "conversion",
        label: t("dep.tipo_conversion"),
        desc:  t("dep.tipo_conversion_desc"),
        icon:  <IconExchange />,
    },
];

export default function DepositarDinero() {
    const { t } = useTranslation();

    // Las listas se calculan en cada render para reflejar el idioma activo
    const MONEDAS        = getMonedas(t);
    const TIPOS_DEPOSITO = getTiposDeposito(t);
    const PASOS          = [
        t("dep.paso_tipo"),
        t("dep.paso_monedas"),
        t("dep.paso_monto"),
        t("dep.paso_seguridad"),
        t("dep.paso_confirmar"),
    ];

    const getMoneda = (codigo) => MONEDAS.find((m) => m.codigo === codigo) || MONEDAS[0];

    const [paso, setPaso]           = useState(0);
    const [tipoDeposito, setTipo]   = useState("directo");
    const [monedaOrigen, setOrigen] = useState("BOB");
    const [monedaDest, setDest]     = useState("BOB");
    const [tipoTasa, setTipoTasa]   = useState("oficial");
    const [metodo, setMetodo]       = useState("ATM");
    const [monto, setMonto]         = useState("");
    const [contrasena, setContra]   = useState("");
    const [pin, setPin]             = useState("");
    const [tasas, setTasas]         = useState([]);
    const [loadingTasas, setLoadT]  = useState(false);
    const [loading, setLoading]     = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError]         = useState("");

    const [correo, setCorreo]               = useState("");
    const [tarjeta, setTarjeta]             = useState("");
    const [loadingSesion, setLoadingSesion] = useState(true);
    const [errorSesion, setErrorSesion]     = useState("");

    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        if (!sesion) {
            setErrorSesion(t("dep.sin_sesion"));
            setLoadingSesion(false);
            return;
        }
        const { nombre_completo } = JSON.parse(sesion);
        getDatosUsuario(nombre_completo)
            .then((data) => {
                setCorreo(data.usuario.correo);
                setTarjeta(data.usuario.tarjeta.numero_tarjeta);
            })
            .catch(() => setErrorSesion(t("dep.error_sesion")))
            .finally(() => setLoadingSesion(false));
    }, [t]);

    useEffect(() => {
        setLoadT(true);
        consultarTasas()
            .then((d) => setTasas(d.tasas || []))
            .catch(() => {})
            .finally(() => setLoadT(false));
    }, []);

    useEffect(() => {
        if (tipoDeposito === "directo") setDest(monedaOrigen);
    }, [tipoDeposito, monedaOrigen]);

    const tasaRef = tasas.find(
        (tx) =>
            tx.Moneda_origen  === monedaOrigen &&
            tx.Moneda_destino === "BOB" &&
            tx.Tipo_tasa      === tipoTasa
    );

    const tasaDestRef = tasas.find(
        (tx) =>
            tx.Moneda_origen  === monedaDest &&
            tx.Moneda_destino === "BOB" &&
            tx.Tipo_tasa      === tipoTasa
    );

    const montoNum        = parseFloat(monto) || 0;
    const montoBOB        = monedaOrigen === "BOB" ? montoNum : montoNum * (tasaRef?.Tasa || 0);
    const montoAcreditado =
        tipoDeposito === "directo"
            ? montoNum
            : monedaDest === "BOB"
            ? montoBOB
            : montoBOB / (tasaDestRef?.Tasa || 1);

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
        try {
            const resp = await realizarDeposito({
                correo,
                numero_tarjeta: tarjeta,
                contrasena,
                pin,
                monto:          montoNum,
                moneda_origen:  monedaOrigen,
                moneda_destino: monedaDest,
                tipo_tasa:      tipoTasa,
                metodo,
            });
            setResultado(resp);
            setPaso(5);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const reiniciar = () => {
        setPaso(0); setTipo("directo"); setOrigen("BOB"); setDest("BOB");
        setTipoTasa("oficial"); setMetodo("ATM"); setMonto("");
        setContra(""); setPin("");
        setResultado(null); setError("");
    };

    if (loadingSesion) {
        return (
            <div className="contenedor">
                <ImportarNav />
                <div className="dep-container">
                    <p className="loading">{t("dep.cargando_sesion")}</p>
                </div>
            </div>
        );
    }

    if (errorSesion) {
        return (
            <div className="contenedor">
                <ImportarNav />
                <div className="dep-container">
                    <p className="dep-error">{errorSesion}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contenedor">
            <ImportarNav />

            <div className="dep-container">

                {/* ── Stepper ─────────────────────────────────────────────── */}
                {paso < 5 && (
                    <div className="dep-stepper">
                        {PASOS.map((s, i) => (
                            <div
                                key={s}
                                className={`dep-step ${i <= paso ? "dep-step--active" : ""} ${i < paso ? "dep-step--done" : ""}`}
                            >
                                <div className="dep-step-circle">{i < paso ? "✓" : i + 1}</div>
                                <span className="dep-step-label">{s}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Paso 0: Tipo de depósito ────────────────────────────── */}
                {paso === 0 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">{t("dep.p0_titulo")}</h2>
                        <div className="dep-tipo-grid">
                            {TIPOS_DEPOSITO.map((tp) => (
                                <button
                                    key={tp.id}
                                    className={`dep-tipo-btn ${tipoDeposito === tp.id ? "dep-tipo-btn--sel" : ""}`}
                                    onClick={() => setTipo(tp.id)}
                                >
                                    <span className="dep-tipo-icon">{tp.icon}</span>
                                    <span className="dep-tipo-label">{tp.label}</span>
                                    <span className="dep-tipo-desc">{tp.desc}</span>
                                </button>
                            ))}
                        </div>
                        <button className="dep-btn-next" onClick={() => setPaso(1)}>
                            {t("dep.continuar")}
                        </button>
                    </div>
                )}

                {/* ── Paso 1: Monedas y monto ─────────────────────────────── */}
                {paso === 1 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">{t("dep.p1_titulo")}</h2>

                        <div className="dep-moneda-row">
                            <div className="dep-moneda-col">
                                <label className="dep-label">{t("dep.moneda_entrega")}</label>
                                <div className="dep-select-wrap">
                                    <select
                                        className="dep-select"
                                        value={monedaOrigen}
                                        onChange={(e) => setOrigen(e.target.value)}
                                    >
                                        {MONEDAS.map((m) => (
                                            <option key={m.codigo} value={m.codigo}>
                                                {m.bandera} {m.codigo} — {m.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {tipoDeposito === "conversion" && (
                                <>
                                    <div className="dep-arrow">→</div>
                                    <div className="dep-moneda-col">
                                        <label className="dep-label">{t("dep.moneda_acreditar")}</label>
                                        <div className="dep-select-wrap">
                                            <select
                                                className="dep-select"
                                                value={monedaDest}
                                                onChange={(e) => setDest(e.target.value)}
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

                        {tipoDeposito === "conversion" && (monedaOrigen !== "BOB" || monedaDest !== "BOB") && (
                            <div className="dep-tasa-row">
                                <span className="dep-label">{t("dep.tipo_tasa")}</span>
                                <div className="dep-radio-group">
                                    {["oficial", "binance"].map((tasa) => (
                                        <label key={tasa} className={`dep-radio ${tipoTasa === tasa ? "dep-radio--sel" : ""}`}>
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
                            </div>
                        )}

                        <div className="dep-tasa-row">
                            <span className="dep-label">{t("dep.metodo_deposito")}</span>
                            <div className="dep-radio-group">
                                {["ATM", "ventanilla", "transferencia"].map((m) => (
                                    <label key={m} className={`dep-radio ${metodo === m ? "dep-radio--sel" : ""}`}>
                                        <input
                                            type="radio"
                                            name="metodo"
                                            value={m}
                                            checked={metodo === m}
                                            onChange={() => setMetodo(m)}
                                        />
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="dep-monto-wrap">
                            <label className="dep-label">{t("dep.monto_label")}</label>
                            <div className="dep-monto-input-row">
                                <span className="dep-simbolo">{getMoneda(monedaOrigen).simbolo}</span>
                                <input
                                    className="dep-monto-input"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                />
                                <span className="dep-codigo">{monedaOrigen}</span>
                            </div>
                        </div>

                        {montoNum > 0 && (
                            <div className="dep-preview">
                                {tipoDeposito === "directo" ? (
                                    <p>
                                        {t("dep.preview_recibiras")}{" "}
                                        <strong>
                                            {getMoneda(monedaOrigen).simbolo} {montoNum.toFixed(2)} {monedaOrigen}
                                        </strong>{" "}
                                        {t("dep.preview_en_cuenta")}
                                    </p>
                                ) : (
                                    <>
                                        {loadingTasas ? (
                                            <p className="dep-preview-loading">{t("dep.cargando_tasas")}</p>
                                        ) : (
                                            <>
                                                <div className="dep-preview-row">
                                                    <span>{t("dep.equiv_bob")}</span>
                                                    <strong>Bs {montoBOB.toFixed(2)}</strong>
                                                </div>
                                                <div className="dep-preview-row">
                                                    <span>{t("dep.recibiras_en")} {monedaDest}</span>
                                                    <strong>
                                                        {getMoneda(monedaDest).simbolo}{" "}
                                                        {montoAcreditado.toFixed(6)} {monedaDest}
                                                    </strong>
                                                </div>
                                                {tasaRef && (
                                                    <div className="dep-preview-tasa">
                                                        {t("dep.tasa_label")} {tipoTasa}: 1 {monedaOrigen} = Bs {tasaRef.Tasa}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="dep-btn-row">
                            <button className="dep-btn-back" onClick={() => setPaso(0)}>{t("dep.atras")}</button>
                            <button
                                className="dep-btn-next"
                                onClick={() => setPaso(2)}
                                disabled={!monto || montoNum <= 0}
                            >
                                {t("dep.continuar")}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 2: Seguridad ───────────────────────────────────── */}
                {paso === 2 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">{t("dep.p2_titulo")}</h2>
                        <p className="dep-card-sub">{t("dep.p2_sub")}</p>

                        <div className="dep-sesion-info">
                            <div className="dep-sesion-fila">
                                <span className="dep-label">{t("dep.cuenta_label")}</span>
                                <span className="dep-sesion-valor">{correo}</span>
                            </div>
                            <div className="dep-sesion-fila">
                                <span className="dep-label">{t("dep.tarjeta_label")}</span>
                                <span className="dep-sesion-valor">••••{tarjeta.slice(-4)}</span>
                            </div>
                        </div>

                        <div className="dep-form-grid">
                            <div className="dep-field">
                                <label className="dep-label">{t("dep.contrasena")}</label>
                                <input
                                    className="dep-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={contrasena}
                                    onChange={(e) => setContra(e.target.value)}
                                />
                            </div>
                            <div className="dep-field">
                                <label className="dep-label">{t("dep.pin")}</label>
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

                        <div className="dep-btn-row">
                            <button className="dep-btn-back" onClick={() => setPaso(1)}>{t("dep.atras")}</button>
                            <button
                                className="dep-btn-next"
                                onClick={() => setPaso(3)}
                                disabled={!contrasena || pin.length < 4}
                            >
                                {t("dep.continuar")}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 3: Resumen ─────────────────────────────────────── */}
                {paso === 3 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">{t("dep.p3_titulo")}</h2>

                        <div className="dep-resumen">
                            <ResumenFila
                                label={t("dep.res_tipo")}
                                valor={tipoDeposito === "directo" ? t("dep.tipo_directo") : t("dep.tipo_conversion")}
                            />
                            <ResumenFila label={t("dep.res_entregas")}    valor={`${getMoneda(monedaOrigen).simbolo} ${montoNum.toFixed(2)} ${monedaOrigen}`} />
                            <ResumenFila label={t("dep.res_acredita")}    valor={`${getMoneda(monedaDest).simbolo} ${montoAcreditado.toFixed(tipoDeposito === "directo" ? 2 : 6)} ${monedaDest}`} />
                            {tipoDeposito === "conversion" && montoBOB > 0 && (
                                <ResumenFila label={t("dep.equiv_bob")}   valor={`Bs ${montoBOB.toFixed(2)}`} />
                            )}
                            {tipoDeposito === "conversion" && tasaRef && (
                                <ResumenFila label={`${t("dep.tasa_label")} ${tipoTasa}`} valor={`1 ${monedaOrigen} = Bs ${tasaRef.Tasa}`} />
                            )}
                            <ResumenFila label={t("dep.res_metodo")}      valor={metodo} />
                            <ResumenFila label={t("dep.res_correo")}      valor={correo} />
                            <ResumenFila label={t("dep.tarjeta_label")}   valor={`••••${tarjeta.slice(-4)}`} />
                        </div>

                        {error && <div className="dep-error">{error}</div>}

                        <div className="dep-btn-row">
                            <button className="dep-btn-back" onClick={() => setPaso(2)}>{t("dep.atras")}</button>
                            <button
                                className="dep-btn-confirm"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? t("dep.procesando") : t("dep.confirmar")}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Paso 5: Éxito ───────────────────────────────────────── */}
                {paso === 5 && resultado && (
                    <div className="dep-card dep-card--success dep-fade">
                        <h2 className="dep-card-title">{t("dep.exito_titulo")} <IconThumbUpFilled /></h2>
                        <p className="dep-success-msg">{resultado.mensaje}</p>

                        <div className="dep-resumen dep-resumen--success">
                            <ResumenFila label={t("dep.exito_recibido")}   valor={resultado.detalle?.montoRecibido} />
                            <ResumenFila label={t("dep.exito_acreditado")} valor={resultado.detalle?.montoAcreditado} />
                            {resultado.detalle?.equivalenteBOB && (
                                <ResumenFila label={t("dep.equiv_bob")}    valor={resultado.detalle.equivalenteBOB} />
                            )}
                            {resultado.detalle?.tasa && (
                                <ResumenFila
                                    label={t("dep.exito_tasa")}
                                    valor={`${resultado.detalle.tasa.origen_a_BOB} (${resultado.detalle.tasa.tipo})`}
                                />
                            )}
                        </div>

                        <button className="dep-btn-next" onClick={reiniciar}>
                            {t("dep.otro_deposito")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResumenFila({ label, valor }) {
    return (
        <div className="dep-resumen-fila">
            <span className="dep-resumen-label">{label}</span>
            <span className="dep-resumen-valor">{valor}</span>
        </div>
    );
}