import React from "react";
import LoginPantalla from "./pantallas/login";
import Cliente from "./pantallas/cliente";
import DepositarDinero from "./pantallas/depositar-dinero";
import RetirarDinero from "./pantallas/retirar_dinero";
import Actividad from "./pantallas/actividad";
import Ayuda from "./pantallas/ayuda";

import { createRoot } from "react-dom/client";
import { BrowserRouter , Routes, Route } from "react-router-dom";


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPantalla />} />
                <Route path="/cliente/" element={<Cliente />} />
                <Route path="/cliente/depositar" element={<DepositarDinero />} />
                <Route path="/cliente/retirar" element={<RetirarDinero />} />
                <Route path="/cliente/actividad" element={<Actividad />} />
                <Route path="/cliente/ayuda" element={<Ayuda />} />
            </Routes>
        </BrowserRouter>
        
    </React.StrictMode>
)
