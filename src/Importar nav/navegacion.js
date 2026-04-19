import "../Css/Navegacion.css"
import { Link } from "react-router-dom";
import { IconCashPlus, IconUser,IconCashMove, IconWallet,IconCashBanknoteMinus,IconScale, IconHelp,IconClipboardData,IconHome, IconSearch } from '@tabler/icons-react';


function Navegacion({ isOpen, onToggle }) {

    const handleToggle = () => {
        if (onToggle) onToggle();
    };

    return (
        <>
        <header>
            <div className="left">
                <div className="menu-container">
                    <div className={`menu ${isOpen ? 'menu-toggle' : ''}`} id="menu" onClick={handleToggle}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div className="brand">
                        <IconWallet className="logo" />
                        <span className="name">ATM</span>
                    </div>
                </div>
            </div>
            <div className="right">
                {/* Depositar */}
                <Link to="/cliente/depositar" className="pestañas icons-header">
                    <IconCashPlus alt="Depositar" />
                </Link>
                {/* retirar dinero */}
                <Link to="/cliente/retirar" className="pestañas icons-header">
                    <IconCashBanknoteMinus alt="retirar" />
                </Link>
                {/* Transferir */}
                <Link to="/cliente/transferir" className="pestañas icons-header">
                    <IconCashMove alt="transferir" />
                </Link>
                {/* Actividad */}
                <Link to="/cliente/actividad" className="pestañas icons-header">
                    <IconClipboardData alt="historial" />
                </Link>
                {/* consultar saldo */}
                <Link to="/cliente/saldo" className="pestañas icons-header">
                    <IconScale alt="saldo" />
                </Link>
                {/* perfil */}
                <Link href="#" className="pestañas icons-header">
                    <IconUser alt="img-user" className="user" />
                </Link>
            </div>
        </header>
        <div className={`sidebar ${isOpen ? 'menu-toggle' : ''}`} id="sidebar" >
            <nav>
                <ul className="nav-list">
                    <li>
                        {/* Buscar */}
                        <Link href="#" className="a search">
                            <IconSearch alt="buscar" className="img" />
                            <span>Buscars</span>
                        </Link>
                    </li>
                    <li>
                        {/* Home */}
                        <Link to="/cliente" className="a selected">
                            <IconHome alt="inicio" className="img" />
                            <span>Inicio</span>
                        </Link>
                    </li>
                    <li>
                        {/* Actividad */}
                        <Link to="/cliente/actividad" className="a">
                            <IconClipboardData alt="actividad" className="img" />
                            <span>Actividad</span>
                        </Link>
                    </li>
                    <li>
                        {/* Retirar Dinero */}
                        <Link to="/cliente/retirar" className="a">
                            <IconCashBanknoteMinus alt="retirar" className="img" />
                            <span>Retirar Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Depositar */}
                        <Link to="/cliente/depositar" className="a">
                            <IconCashPlus alt="agregar" className="img" />
                            <span>Depositar Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Transferir */}
                        <Link to="/cliente/transferir" className="a">
                            <IconCashMove alt="transferir" className="img" />
                            <span>Transferir Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Ayuda */}
                        <Link to="/cliente/ayuda" className="a">
                            <IconHelp alt="ayuda" className="img" />
                            <span>Ayuda</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
        </>
    );
}

export default Navegacion;