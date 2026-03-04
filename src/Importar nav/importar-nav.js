import { useState } from "react";
import Navegacion from "../pantallas/navegacion";
function ImportarNav() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const handleSidebarToggle = () => {
            setSidebarOpen(open => !open);
    };
    return (
        <Navegacion isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
    )};

export default ImportarNav;