import "../Css/Navegacion.css"
import { Link } from "react-router-dom";
import { IconCashPlus, IconUser, IconWallet, IconHelp,IconClipboardData,IconHome, IconSearch } from '@tabler/icons-react';

function Navegacion() {
    return (
        <>
        <header>
            <div className="left">
                <div className="menu-container">
                    <div className="menu">
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
                <Link href="#" className="pestañas">
                    <IconCashPlus alt="chat" />
                </Link>
                {/* retirar dinero */}
                <Link href="#" className="pestañas">
                    <IconCashPlus alt="question" />
                </Link>
                {/*Historial */}
                <Link href="#" className="pestañas">
                    <IconCashPlus alt="notificacion" />
                </Link>
                {/* perfil */}
                <Link href="#" className="pestañas">
                    <IconUser alt="img-user" className="user" />
                </Link>
            </div>
        </header>
        <div className="sidebar">
            <nav>
                <ul>
                    <li>
                        {/* Buscar */}
                        <Link href="#">
                            <IconSearch alt="buscar" />
                            <span>Buscars</span>
                        </Link>
                    </li>
                    <li>
                        {/* Home */}
                        <Link href="#">
                            <IconHome alt="inicio" />
                            <span>Inicio</span>
                        </Link>
                    </li>
                    <li>
                        {/* Actividad */}
                        <Link href="#">
                            <IconClipboardData alt="actividad" />
                            <span>Actividad</span>
                        </Link>
                    </li>
                    <li>
                        {/* Retirar Dinero */}
                        <Link href="#">
                            <IconCashPlus alt="retirar" />
                            <span>Retirar Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Agregar Dinero */}
                        <Link href="#">
                            <IconCashPlus alt="agregar" />
                            <span>Agregar Dinero</span>
                        </Link>
                    </li>
                    <li>
                        {/* Ayuda */}
                        <Link href="#">
                            <IconHelp alt="ayuda" />
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