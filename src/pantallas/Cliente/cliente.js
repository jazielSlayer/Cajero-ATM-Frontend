import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../Css/cliente.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { getDatosUsuario } from "../../Api/Api_cliente/Datos_cliente";

function Cliente() {
    const { t } = useTranslation();

    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datosOcultos, setDatosOcultos] = useState(false);
    const [datosOcultosTarjeta, setDatosOcultosTarjeta] = useState(false);

    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");

        if (!sesion) { setError(t("cli.sin_sesion")); setLoading(false); return; }
        const { nombre_completo } = JSON.parse(sesion);
        if (!nombre_completo) { setError(t("cli.sin_nombre")); setLoading(false); return; }
        getDatosUsuario(nombre_completo)
            .then((data) => { setDatos(data); setLoading(false); })
            .catch(() => { setError(t("cli.error_carga")); setLoading(false); });
    }, [t]);

    if (loading) return <div className="cliente"><ImportarNav /><p className="loading">{t("cli.cargando")}</p></div>;
    if (error)   return <div className="cliente"><ImportarNav /><p className="error">{error}</p></div>;

    const { usuario, transferencias, depositos, retiros } = datos;

    const tarjetaMascarada = usuario.tarjeta.numero_tarjeta
        ? usuario.tarjeta.numero_tarjeta
        : "**** **** ****";

    const numeroVisibleTarjeta = datosOcultosTarjeta
        ? "**** **** **** ****"
        : tarjetaMascarada;

    const fechaVenc = usuario.tarjeta.fecha_vencimiento
        ? new Date(usuario.tarjeta.fecha_vencimiento).toLocaleDateString("es-ES", { month: "2-digit", year: "2-digit" })
        : "N/A";

    const ocultar = (valor) => datosOcultos ? "************" : valor;

    const ultimasTransacciones = [
        ...transferencias.map(t => ({ ...t, _tipo: "Transferencia" })),
        ...depositos.map(t => ({ ...t, _tipo: "Deposito" })),
        ...retiros.map(t => ({ ...t, _tipo: "Retiro" })),
    ]
        .sort((a, b) => new Date(b.Fecha_transaccion) - new Date(a.Fecha_transaccion))
        .slice(0, 6);

    return (
        <div className="cliente">
            <ImportarNav />

            <div className="info-cards">

                {/* ── Cuenta ─────────────────────────────────────────────── */}
                <div className="account-info holo-card">
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <h2>{t("cli.cuenta")}</h2>
                        <button
                            className="btn-ocultar"
                            onClick={() => setDatosOcultos(!datosOcultos)}
                            title={datosOcultos ? t("cli.mostrar_datos") : t("cli.ocultar_datos")}
                        >
                            {datosOcultos
                                ? <i className="ti ti-eye" />
                                : <i className="ti ti-eye-off" />
                            }
                        </button>
                    </div>
                    <p><span className="label">{t("cli.numero")}:</span> {ocultar(usuario.cuenta.numero_cuenta)}</p>
                    <p><span className="label">{t("cli.saldo")}:</span> {ocultar("$" + Number(usuario.cuenta.saldo).toLocaleString("es-BO", { minimumFractionDigits: 2 }))}</p>
                    <p><span className="label">{t("cli.estado")}:</span> {usuario.cuenta.estado}</p>
                </div>

                {/* ── Tarjeta holográfica ────────────────────────────────── */}
                <div className="card-info holo-card tarjeta-banco">
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <span className="chip">
                            <i className="ti ti-cpu" />
                        </span>
                        <button
                            className="btn-ocultar"
                            onClick={() => setDatosOcultosTarjeta(!datosOcultosTarjeta)}
                            title={datosOcultosTarjeta ? t("cli.mostrar_datos") : t("cli.ocultar_datos")}
                        >
                            {datosOcultosTarjeta
                                ? <i className="ti ti-eye" />
                                : <i className="ti ti-eye-off" />
                            }
                        </button>
                    </div>
                    <div className="tarjeta-numero">{numeroVisibleTarjeta}</div>
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

            {/* ── Historial ──────────────────────────────────────────────── */}
            <div className="historial">
                <h2>{t("cli.ultimas_transacciones")}</h2>
                {ultimasTransacciones.length === 0 ? (
                    <p className="sin-datos">{t("cli.sin_transacciones")}</p>
                ) : (
                    <div className="tabla-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("cli.col_fecha")}</th>
                                    <th>{t("cli.col_tipo")}</th>
                                    <th>{t("cli.col_metodo")}</th>
                                    <th>{t("cli.col_monto")}</th>
                                    <th>{t("cli.col_descripcion")}</th>
                                    <th>{t("cli.col_destinatario")}</th>
                                    <th>{t("cli.col_estado")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimasTransacciones.map((tx) => (
                                    <tr key={tx.transaccion_id}>
                                        <td data-label={t("cli.col_fecha")}>
                                            {new Date(tx.Fecha_transaccion).toLocaleDateString("es-ES")}
                                        </td>
                                        <td data-label={t("cli.col_tipo")}>{tx._tipo}</td>
                                        <td data-label={t("cli.col_metodo")}>{tx.Metodo_transaccion}</td>
                                        <td
                                            data-label={t("cli.col_monto")}
                                            className={tx._tipo === "Deposito" ? "monto-positivo" : "monto-negativo"}
                                        >
                                            {tx._tipo === "Deposito" ? "+" : "-"}
                                            Bs. {Number(tx.Monto).toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td data-label={t("cli.col_descripcion")}>{tx.Descripcion ?? "-"}</td>
                                        <td data-label={t("cli.col_destinatario")}>{tx.nombre_destinatario ?? "-"}</td>
                                        <td data-label={t("cli.col_estado")}>{tx.estado_transaccion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cliente;