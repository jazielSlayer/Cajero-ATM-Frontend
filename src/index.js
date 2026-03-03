import React from "react";
import LoginPantalla from "./pantallas/login";
import Cliente from "./pantallas/cliente";

import { createRoot } from "react-dom/client";
import { BrowserRouter , Routes, Route } from "react-router-dom";


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPantalla />} />
                <Route path="/cliente/" element={<Cliente />} />
            </Routes>
        </BrowserRouter>
        
    </React.StrictMode>
)
