import "../Css/Navegacion.css"
import { Link } from "react-router-dom";
import { IconCashPlus, IconUser, IconWallet, IconHelp,IconClipboardData,IconHome, IconSearch } from '@tabler/icons-react';

// Receive props from parent to control sidebar state
function Navegacion({ isOpen, onToggle }) {
    // handleToggle comes from parent "Cliente" component
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
                {/* agregar dinero */}
                <Link href="#" className="pestañas icons-header">
                    <IconCashPlus alt="chat" />
                </Link>
                {/* retirar dinero */}
                <Link href="#" className="pestañas icons-header">
                    <IconCashPlus alt="question" />
                </Link>
                {/*Historial */}
                <Link href="#" className="pestañas icons-header">
                    <IconCashPlus alt="notificacion" />
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
                        <Link href="#" className="a selected">
                            <IconHome alt="inicio" className="img" />
                            <span>Inicio</span>
                        </Link>
                    </li>
                    <li>
                        {/* Actividad */}
                        <Link href="#" className="a">
                            <IconClipboardData alt="actividad" className="img" />
                            <span>Actividad</span>
                        </Link>
                    </li>
                    <li>
                        {/* Retirar Dinero */}
                        <Link href="#" className="a">
                            <IconCashPlus alt="retirar" className="img" />
                            <span>Retirar Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Agregar Dinero */}
                        <Link href="#" className="a">
                            <IconCashPlus alt="agregar" className="img" />
                            <span>Agregar Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Ayuda */}
                        <Link href="#" className="a">
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