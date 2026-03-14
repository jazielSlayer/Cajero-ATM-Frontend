import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./Authcontext";
import RutaProtegida   from "./Rutaprotegida";

import LoginPantalla   from "./pantallas/login";
import Cliente         from "./pantallas/cliente";
import DepositarDinero from "./pantallas/depositar-dinero";
import RetirarDinero   from "./pantallas/retirar_dinero";
import Actividad       from "./pantallas/actividad";
import Ayuda           from "./pantallas/ayuda";
import Admin           from "./pantallas/pantallas de administradore/admin";
import Operador        from "./pantallas/pantallas de administradore/operador";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Pública */}
                    <Route path="/" element={<LoginPantalla />} />

                    {/* ── Rutas de Cliente ── */}
                    <Route path="/cliente/" element={
                        <RutaProtegida roles={["Cliente"]}>
                            <Cliente />
                        </RutaProtegida>
                    } />
                    <Route path="/cliente/depositar" element={
                        <RutaProtegida roles={["Cliente"]}>
                            <DepositarDinero />
                        </RutaProtegida>
                    } />
                    <Route path="/cliente/retirar" element={
                        <RutaProtegida roles={["Cliente"]}>
                            <RetirarDinero />
                        </RutaProtegida>
                    } />
                    <Route path="/cliente/actividad" element={
                        <RutaProtegida roles={["Cliente"]}>
                            <Actividad />
                        </RutaProtegida>
                    } />
                    <Route path="/cliente/ayuda" element={
                        <RutaProtegida roles={["Cliente"]}>
                            <Ayuda />
                        </RutaProtegida>
                    } />

                    {/* ── Ruta de Administrador ── */}
                    <Route path="/admin/" element={
                        <RutaProtegida roles={["Administrador"]}>
                            <Admin />
                        </RutaProtegida>
                    } />

                    {/* ── Ruta de Operador ── */}
                    <Route path="/operador/" element={
                        <RutaProtegida roles={["Operador"]}>
                            <Operador />
                        </RutaProtegida>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);