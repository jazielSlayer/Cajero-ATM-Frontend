import { useState, useEffect } from "react";
import "../../Css/Depositar.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { realizarDeposito, consultarTasas } from "../../Api/Api_cliente/Hacer_Transaccion";
import { getDatosUsuario } from "../../Api/Api_cliente/Datos_cliente";
import { IconExchange, IconReportMoneyFilled, IconThumbUpFilled } from "@tabler/icons-react";


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

function getMoneda(codigo) {
    return MONEDAS.find((m) => m.codigo === codigo) || MONEDAS[0];
}


const TIPOS_DEPOSITO = [
    {
        id: "directo",
        label: "Depósito Directo",
        desc: "Acredita en la misma moneda que entregas",
        icon: <IconReportMoneyFilled />
    },
    {
        id: "conversion",
        label: "Depósito con Conversión",
        desc: "Convierte a otra moneda al acreditar",
        icon: <IconExchange />
    },
];


const PASOS = ["Tipo", "Monedas", "Monto", "Seguridad", "Confirmar"];

export default function DepositarDinero() {
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


    const [correo, setCorreo]     = useState("");
    const [tarjeta, setTarjeta]   = useState("");
    const [loadingSesion, setLoadingSesion] = useState(true);
    const [errorSesion, setErrorSesion]     = useState("");

    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        if (!sesion) {
            setErrorSesion("No se encontró sesión activa.");
            setLoadingSesion(false);
            return;
        }
        const { nombre_completo } = JSON.parse(sesion);
        getDatosUsuario(nombre_completo)
            .then((data) => {
                setCorreo(data.usuario.correo);
                setTarjeta(data.usuario.tarjeta.numero_tarjeta);
            })
            .catch(() => setErrorSesion("Error al cargar datos de sesión."))
            .finally(() => setLoadingSesion(false));
    }, []);

    // Cargar tasas al montar
    useEffect(() => {
        setLoadT(true);
        consultarTasas()
            .then((d) => setTasas(d.tasas || []))
            .catch(() => {})
            .finally(() => setLoadT(false));
    }, []);

    // Si depósito directo, destino = origen
    useEffect(() => {
        if (tipoDeposito === "directo") setDest(monedaOrigen);
    }, [tipoDeposito, monedaOrigen]);

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
                    <p className="loading">Cargando datos de sesión…</p>
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

                
                {paso === 0 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">¿Qué tipo de depósito deseas realizar?</h2>
                        <div className="dep-tipo-grid">
                            {TIPOS_DEPOSITO.map((t) => (
                                <button
                                    key={t.id}
                                    className={`dep-tipo-btn ${tipoDeposito === t.id ? "dep-tipo-btn--sel" : ""}`}
                                    onClick={() => setTipo(t.id)}
                                >
                                    <span className="dep-tipo-icon">{t.icon}</span>
                                    <span className="dep-tipo-label">{t.label}</span>
                                    <span className="dep-tipo-desc">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                        <button className="dep-btn-next" onClick={() => setPaso(1)}>
                            Continuar →
                        </button>
                    </div>
                )}

                
                {paso === 1 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">Moneda y monto</h2>

                        <div className="dep-moneda-row">
                            <div className="dep-moneda-col">
                                <label className="dep-label">Moneda que entregas</label>
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
                                        <label className="dep-label">Moneda a acreditar</label>
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
                                <span className="dep-label">Tipo de tasa</span>
                                <div className="dep-radio-group">
                                    {["oficial", "binance"].map((t) => (
                                        <label key={t} className={`dep-radio ${tipoTasa === t ? "dep-radio--sel" : ""}`}>
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

                        <div className="dep-tasa-row">
                            <span className="dep-label">Método de depósito</span>
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
                            <label className="dep-label">Monto a depositar</label>
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
                                        Recibirás{" "}
                                        <strong>
                                            {getMoneda(monedaOrigen).simbolo} {montoNum.toFixed(2)} {monedaOrigen}
                                        </strong>{" "}
                                        en tu cuenta.
                                    </p>
                                ) : (
                                    <>
                                        {loadingTasas ? (
                                            <p className="dep-preview-loading">Cargando tasas…</p>
                                        ) : (
                                            <>
                                                <div className="dep-preview-row">
                                                    <span>Equivalente en BOB</span>
                                                    <strong>Bs {montoBOB.toFixed(2)}</strong>
                                                </div>
                                                <div className="dep-preview-row">
                                                    <span>Recibirás en {monedaDest}</span>
                                                    <strong>
                                                        {getMoneda(monedaDest).simbolo}{" "}
                                                        {montoAcreditado.toFixed(6)} {monedaDest}
                                                    </strong>
                                                </div>
                                                {tasaRef && (
                                                    <div className="dep-preview-tasa">
                                                        Tasa {tipoTasa}: 1 {monedaOrigen} = Bs {tasaRef.Tasa}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="dep-btn-row">
                            <button className="dep-btn-back" onClick={() => setPaso(0)}>← Atrás</button>
                            <button
                                className="dep-btn-next"
                                onClick={() => setPaso(2)}
                                disabled={!monto || montoNum <= 0}
                            >
                                Continuar →
                            </button>
                        </div>
                    </div>
                )}

                
                {paso === 2 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">Verificación de seguridad</h2>
                        <p className="dep-card-sub">Ingresa tu contraseña y PIN para confirmar</p>

                        {/* Datos de sesión (solo lectura, informativo) */}
                        <div className="dep-sesion-info">
                            <div className="dep-sesion-fila">
                                <span className="dep-label">Cuenta</span>
                                <span className="dep-sesion-valor">{correo}</span>
                            </div>
                            <div className="dep-sesion-fila">
                                <span className="dep-label">Tarjeta</span>
                                <span className="dep-sesion-valor">••••{tarjeta.slice(-4)}</span>
                            </div>
                        </div>

                        <div className="dep-form-grid">
                            <div className="dep-field">
                                <label className="dep-label">Contraseña</label>
                                <input
                                    className="dep-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={contrasena}
                                    onChange={(e) => setContra(e.target.value)}
                                />
                            </div>
                            <div className="dep-field">
                                <label className="dep-label">PIN de tarjeta</label>
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
                            <button className="dep-btn-back" onClick={() => setPaso(1)}>← Atrás</button>
                            <button
                                className="dep-btn-next"
                                onClick={() => setPaso(3)}
                                disabled={!contrasena || pin.length < 4}
                            >
                                Continuar →
                            </button>
                        </div>
                    </div>
                )}

                
                {paso === 3 && (
                    <div className="dep-card dep-fade">
                        <h2 className="dep-card-title">Resumen del depósito</h2>

                        <div className="dep-resumen">
                            <ResumenFila label="Tipo"           valor={tipoDeposito === "directo" ? "Depósito directo" : "Con conversión"} />
                            <ResumenFila label="Entregas"       valor={`${getMoneda(monedaOrigen).simbolo} ${montoNum.toFixed(2)} ${monedaOrigen}`} />
                            <ResumenFila label="Se acredita"    valor={`${getMoneda(monedaDest).simbolo} ${montoAcreditado.toFixed(tipoDeposito === "directo" ? 2 : 6)} ${monedaDest}`} />
                            {tipoDeposito === "conversion" && montoBOB > 0 && (
                                <ResumenFila label="Equivalente BOB" valor={`Bs ${montoBOB.toFixed(2)}`} />
                            )}
                            {tipoDeposito === "conversion" && tasaRef && (
                                <ResumenFila label={`Tasa ${tipoTasa}`} valor={`1 ${monedaOrigen} = Bs ${tasaRef.Tasa}`} />
                            )}
                            <ResumenFila label="Método"         valor={metodo} />
                            <ResumenFila label="Correo"         valor={correo} />
                            <ResumenFila label="Tarjeta"        valor={`••••${tarjeta.slice(-4)}`} />
                        </div>

                        {error && <div className="dep-error">{error}</div>}

                        <div className="dep-btn-row">
                            <button className="dep-btn-back" onClick={() => setPaso(2)}>← Atrás</button>
                            <button
                                className="dep-btn-confirm"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Procesando…" : "✓ Confirmar depósito"}
                            </button>
                        </div>
                    </div>
                )}

               
                {paso === 5 && resultado && (
                    <div className="dep-card dep-card--success dep-fade">
                        
                        <h2 className="dep-card-title">¡Depósito exitoso!   <IconThumbUpFilled/></h2>
                        <p className="dep-success-msg">{resultado.mensaje}</p>

                        <div className="dep-resumen dep-resumen--success">
                            
                            <ResumenFila label="Monto recibido"   valor={resultado.detalle?.montoRecibido} />
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

                        <button className="dep-btn-next" onClick={reiniciar}>
                            Hacer otro depósito
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