// ── navegacion.jsx ───────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import "../Css/Navegacion.css";
import "../Css/Traductor.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    IconCashPlus, IconUser, IconCashMove, IconWallet,
    IconCashBanknoteMinus, IconScale, IconHelp,
    IconClipboardData, IconHome, IconSearch, IconLanguage,
} from "@tabler/icons-react";

const IDIOMAS = [
    { code: "es",  label: "Español",   flag: "🇧🇴" },
    { code: "en",  label: "English",   flag: "🇺🇸" },
    { code: "pt",  label: "Português", flag: "🇧🇷" },
    { code: "fr",  label: "Français",  flag: "🇫🇷" },
    { code: "de",  label: "Deutsch",   flag: "🇩🇪" },
];

function Navegacion({ isOpen, onToggle }) {
    const { t, i18n } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const idiomaActual = IDIOMAS.find((i) => i.code === i18n.language) || IDIOMAS[0];

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target))
                setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSeleccionar = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("atm_idioma", code);
        setMenuOpen(false);
    };

    return (
        <>
            <header>
                <div className="left">
                    <div className="menu-container">
                        <div
                            className={`menu ${isOpen ? "menu-toggle" : ""}`}
                            id="menu"
                            onClick={onToggle}
                        >
                            <div /><div /><div />
                        </div>
                        <div className="brand">
                            <IconWallet className="logo" />
                            <span className="name">ATM</span>
                        </div>
                    </div>
                </div>

                <div className="right">
                    <Link to="/cliente/depositar" className="pestañas icons-header"><IconCashPlus /></Link>
                    <Link to="/cliente/retirar"   className="pestañas icons-header"><IconCashBanknoteMinus /></Link>
                    <Link to="/cliente/transferir" className="pestañas icons-header"><IconCashMove /></Link>
                    <Link to="/cliente/actividad"  className="pestañas icons-header"><IconClipboardData /></Link>
                    <Link to="/cliente/saldo"      className="pestañas icons-header"><IconScale /></Link>

                    {/* ── Selector de idioma ─────────────────────────────── */}
                    <div className="lang-selector" ref={menuRef}>
                        <button
                            className="lang-trigger"
                            onClick={() => setMenuOpen((o) => !o)}
                            title={t("lang.titulo")}
                            aria-haspopup="listbox"
                            aria-expanded={menuOpen}
                        >
                            <IconLanguage size={16} />
                            <span className="lang-flag">{idiomaActual.flag}</span>
                            <span className="lang-code">
                                {idiomaActual.code.toUpperCase().slice(0, 2)}
                            </span>
                            <span className={`lang-arrow ${menuOpen ? "open" : ""}`}>▾</span>
                        </button>

                        {menuOpen && (
                            <ul className="lang-dropdown" role="listbox">
                                {IDIOMAS.map((idioma) => (
                                    <li
                                        key={idioma.code}
                                        role="option"
                                        aria-selected={idioma.code === i18n.language}
                                        className={`lang-option ${
                                            idioma.code === i18n.language ? "lang-active" : ""
                                        }`}
                                        onClick={() => handleSeleccionar(idioma.code)}
                                    >
                                        <span className="lang-opt-flag">{idioma.flag}</span>
                                        <span className="lang-opt-label">{idioma.label}</span>
                                        {idioma.code === i18n.language && (
                                            <span className="lang-check">✓</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link href="#" className="pestañas icons-header">
                        <IconUser className="user" />
                    </Link>
                </div>
            </header>

            {/* ── Sidebar ────────────────────────────────────────────────── */}
            <div className={`sidebar ${isOpen ? "menu-toggle" : ""}`} id="sidebar">
                <nav>
                    <ul className="nav-list">
                        <li>
                            <Link href="#" className="a search">
                                <IconSearch className="img" />
                                <span>{t("nav.buscar")}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cliente" className="a selected">
                                <IconHome className="img" />
                                <span>{t("nav.inicio")}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cliente/actividad" className="a">
                                <IconClipboardData className="img" />
                                <span>{t("nav.actividad")}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cliente/retirar" className="a">
                                <IconCashBanknoteMinus className="img" />
                                <span>{t("nav.retirar")}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cliente/depositar" className="a">
                                <IconCashPlus className="img" />
                                <span>{t("nav.depositar")}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cliente/transferir" className="a">
                                <IconCashMove className="img" />
                                <span>{t("nav.transferir")}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/cliente/ayuda" className="a">
                                <IconHelp className="img" />
                                <span>{t("nav.ayuda")}</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
}

export default Navegacion;