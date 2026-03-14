import { useEffect, useState } from "react";
import "../../Css/cliente.css";
import ImportarNav from "../../Importar nav/importar-nav";
import { getDatosUsuario } from "../../Api/Api_cliente/Datos_cliente";

function Cliente() {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    // Leer desde sessionStorage con la clave correcta
    const sesion = sessionStorage.getItem("usuario_atm");

    if (!sesion) {
        setError("No se encontró el usuario en sesión.");
        setLoading(false);
        return;
    }

    const { nombre_completo } = JSON.parse(sesion);

    if (!nombre_completo) {
        setError("No se encontró el nombre del usuario en sesión.");
        setLoading(false);
        return;
    }

    getDatosUsuario(nombre_completo)
        .then((data) => {
            setDatos(data);
            setLoading(false);
        })
        .catch(() => {
            setError("Error al cargar los datos del usuario.");
            setLoading(false);
        });
}, []);

    if (loading) return <div className="cliente"><ImportarNav /><p className="loading">Cargando datos...</p></div>;
    if (error)   return <div className="cliente"><ImportarNav /><p className="error">{error}</p></div>;

    const { usuario, transacciones } = datos;

    // Formatear número de tarjeta enmascarado
    const tarjetaMascarada = usuario.tarjeta.numero_tarjeta
        ? "**** **** **** " + usuario.tarjeta.numero_tarjeta.slice(-4)
        : "N/A";

    // Formatear fecha de vencimiento
    const fechaVenc = usuario.tarjeta.fecha_vencimiento
        ? new Date(usuario.tarjeta.fecha_vencimiento).toLocaleDateString("es-ES", { month: "2-digit", year: "2-digit" })
        : "N/A";

    return (
        <div className="cliente">
            <ImportarNav />

            <div className="info-cards">
                {/* Cuenta */}
                <div className="account-info">
                    <h2>Cuenta</h2>
                    <p>Número: {usuario.cuenta.numero_cuenta}</p>
                    <p>Saldo: ${Number(usuario.cuenta.saldo).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</p>
                    <p>Estado: {usuario.cuenta.estado}</p>
                </div>

                {/* Tarjeta */}
                <div className="card-info">
                    <h2>Tarjeta</h2>
                    <p>Número: {tarjetaMascarada}</p>
                    <p>Tipo: {usuario.tarjeta.tipo_tarjeta}</p>
                    <p>Vencimiento: {fechaVenc}</p>
                </div>
            </div>

            {/* Historial de transacciones */}
            <div className="historial">
                <h2>Últimas transacciones</h2>
                {transacciones.length === 0 ? (
                    <p>No hay transacciones registradas.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Método</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Destintario</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transacciones.map((t) => (
                                <tr key={t.transaccion_id}>
                                    <td>{new Date(t.Fecha_transaccion).toLocaleDateString("es-ES")}</td>
                                    <td>{t.tipo_transaccion}</td>
                                    <td>{t.Metodo_transaccion}</td>
                                    <td>{t.Descripcion ?? "-"}</td>
                                    <td className={t.tipo_transaccion === "Deposito" ? "monto-positivo" : "monto-negativo"}>
                                        {t.tipo_transaccion === "Deposito" ? "+" : "-"}
                                        ${Number(t.Monto).toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>{t.nombre_destinatario}</td>
                                    <td>{t.estado_transaccion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Cliente;