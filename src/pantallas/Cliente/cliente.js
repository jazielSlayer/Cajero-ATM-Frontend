import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../Css/cliente.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { getDatosUsuario } from "../../Api/Api_cliente/Datos_cliente";

function Cliente() {
    
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datosOcultos, setDatosOcultos] = useState(false);
    const [datosOcultosTarjeta, setDatosOcultosTarjeta] = useState(false);

    useEffect(() => {
        const sesion = sessionStorage.getItem("usuario_atm");
        
        if (!sesion) { setError("No se encontró el usuario en sesión."); setLoading(false); return; }
        const { nombre_completo } = JSON.parse(sesion);
        if (!nombre_completo) { setError("No se encontró el nombre del usuario en sesión."); setLoading(false); return; }
        getDatosUsuario(nombre_completo)
            .then((data) => { setDatos(data); setLoading(false); })
            .catch(() => { setError("Error al cargar los datos del usuario."); setLoading(false); });
    }, []);

    if (loading) return <div className="cliente"><ImportarNav /><p className="loading">Cargando datos...</p></div>;
    if (error)   return <div className="cliente"><ImportarNav /><p className="error">{error}</p></div>;

    const { usuario, transferencias, depositos, retiros } = datos;
    
    const tarjetaMascarada = usuario.tarjeta.numero_tarjeta
        ?  usuario.tarjeta.numero_tarjeta
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

            
                <div className="account-info holo-card">
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <h2>Cuenta</h2>
                        <button
                            className="btn-ocultar"
                            onClick={() => setDatosOcultos(!datosOcultos)}
                            title={datosOcultos ? "Mostrar datos" : "Ocultar datos"}
                        >
                            {datosOcultos
                                ? <i className="ti ti-eye" />
                                : <i className="ti ti-eye-off" />
                            }
                        </button>
                    </div>
                    <p><span className="label">Número:</span> {ocultar(usuario.cuenta.numero_cuenta)}</p>
                    <p><span className="label">Saldo:</span> {ocultar("$" + Number(usuario.cuenta.saldo).toLocaleString("es-BO", { minimumFractionDigits: 2 }))}</p>
                    <p><span className="label">Estado:</span> {usuario.cuenta.estado}</p>
                </div>

                {/* Tarjeta holográfica estilo banco */}
                <div className="card-info holo-card tarjeta-banco">
                    <div className="holo-shine" />
                    <div className="card-header-row">
                        <span className="chip">
                            <i className="ti ti-cpu" />
                        </span>
                        <button
                            className="btn-ocultar"
                            onClick={() => setDatosOcultosTarjeta(!datosOcultosTarjeta)}
                            title={datosOcultosTarjeta ? "Mostrar datos" : "Ocultar datos"}
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
                            <span className="label-small">Titular</span>
                            <p className="tarjeta-titular">{usuario.nombre} {usuario.apellido}</p>
                        </div>
                        <div>
                            <span className="label-small">Vence</span>
                            <p className="tarjeta-venc">{fechaVenc}</p>
                        </div>
                        <div>
                            <span className="label-small">Tipo</span>
                            <p className="tarjeta-tipo">{usuario.tarjeta.tipo_tarjeta}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="historial">
                <h2>Últimas transacciones</h2>
                {ultimasTransacciones.length === 0 ? (
                    <p className="sin-datos">No hay transacciones registradas.</p>
                ) : (
                    <div className="tabla-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Método</th>
                                    <th>Monto</th>
                                    <th>Descripción</th>
                                    <th>Destinatario</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimasTransacciones.map((t) => (
                                    <tr key={t.transaccion_id}>
                                        <td data-label="Fecha">
                                            {new Date(t.Fecha_transaccion).toLocaleDateString("es-ES")}
                                        </td>
                                        <td data-label="Tipo">{t._tipo}</td>
                                        <td data-label="Método">{t.Metodo_transaccion}</td>
                                        <td
                                            data-label="Monto"
                                            className={t._tipo === "Deposito" ? "monto-positivo" : "monto-negativo"}
                                        >
                                            {t._tipo === "Deposito" ? "+" : "-"}
                                            Bs. {Number(t.Monto).toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td data-label="Descripción">{t.Descripcion ?? "-"}</td>
                                        <td data-label="Destinatario">{t.nombre_destinatario ?? "-"}</td>
                                        <td data-label="Estado">{t.estado_transaccion}</td>
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