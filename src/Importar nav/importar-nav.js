import { useState } from "react";
import Navegacion from "./navegacion";
function ImportarNav() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const handleSidebarToggle = () => {
            setSidebarOpen(open => !open);
    };
    return (
        <Navegacion isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
    )};

export default ImportarNav;