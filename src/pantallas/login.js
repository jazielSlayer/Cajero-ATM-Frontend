import "../Css/Login.css";

function LoginPantalla () {
    return (
        <div className="Page">
            <div className="formulario">
            <h1 className="TituloLogin">Inicio de sesion</h1>
            <form method="post">
                <div className="username">
                    <input type="text" required>
                    </input>
                    <label>Pin</label>
                </div>
                <div className="username">
                    <input type="password" required>
                    </input>
                    <label>Contraseña</label>
                </div>
                <input type="submit" value="Iniciar" ></input>
            </form>
        </div>
        </div>
    )
}

export default LoginPantalla;