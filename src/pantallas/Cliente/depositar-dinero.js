import "../../Css/Depositar.css"
import ImportarNav from "../../Importar nav/importar-nav";


function DepositarDinero() {
    
    return (
        <div className="contenedor">
            <ImportarNav />
            <h1 className="Depositar">depositar dinero</h1>
            {/**mostrar la cantidad a depositar, si quiere comprar dolares mostrar al tipo de cambio paralelo y oficial en bolivia
             * , mostar la tasa de cambio neta 
             */}
        </div>
    )
};

export default DepositarDinero;