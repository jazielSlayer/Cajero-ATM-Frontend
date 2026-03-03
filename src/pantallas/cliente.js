import "../Css/cliente.css";

/** numero de cuenta saldo estado
 * numero de tarjeta tipo estado y fecha de vencimiento
 * historial de transacciones y tipo de transaccion
 */

function Cliente () {
    return (
        <div className="cliente">
            <div className="info-cards">
                <div className="account-info">
                    <h2>Cuenta</h2>
                    <p>Número: 12345678</p>
                    <p>Saldo: $1,234.56</p>
                    <p>Estado: Activa</p>
                </div>
                <div className="card-info">
                    <h2>Tarjeta</h2>
                    <p>Número: **** **** **** 1234</p>
                    <p>Tipo: Débito</p>
                    <p>Vencimiento: 12/24</p>
                </div>
            </div>
            {/* historial de transacciones */}
            <div className="historial">
                <h2>Últimas transacciones</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>01-03-2026</td>
                            <td>Compra tienda</td>
                            <td>-$45.00</td>
                            <td>Débito</td>
                        </tr>
                        <tr>
                            <td>28-02-2026</td>
                            <td>Depósito</td>
                            <td>+$500.00</td>
                            <td>Crédito</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Cliente;
