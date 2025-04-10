class Auth {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.updateUI();
            this.addEventListeners();
        });
    }

    async login(nomUsuario, password) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/login?nomUsuario=${encodeURIComponent(nomUsuario)}&password=${encodeURIComponent(password)}`
          );
      
          const data = await response.json();
      
          if (data.success) {
            this.user = {
              idCliente: data.usuario.idCliente,
              nomUsuario: data.usuario.nomUsuario,
              rol: data.usuario.rol
            };
            localStorage.setItem("user", JSON.stringify(this.user));
            this.updateUI();
          } else {
            if (data.errores && Array.isArray(data.errores)) {
              alert("Errores:\n" + data.errores.join("\n"));
            } else if (data.mensaje) {
              alert("Acceso denegado: " + data.mensaje);
            } else {
              alert("Acceso denegado por un error desconocido.");
            }
          }
        } catch (error) {
          alert("Error de red: " + error.message);
        }
      }
      

    logout() {
        localStorage.removeItem("user");
        this.user = null;
        this.updateUI();
    }

    updateUI() {
        const adminMenu = document.querySelector("nav ul li a[href='#']");
        const loginLink = document.querySelector("nav ul li a[href='Login.html']");
        const formLogin = document.querySelector("section form");
        const formRegistro = document.getElementById("nuevoRegistro");
        
        if (this.user && this.user.rol === "Administrador") {
            adminMenu.parentElement.style.display = "block";
            formLogin.parentElement.style.visibility = "hidden";
            formRegistro.parentElement.style.visibility = "hidden";
            loginLink.textContent = "Cerrar Sesión";
            loginLink.setAttribute("href", "Login.html");
        } else {
            adminMenu.parentElement.style.display = "none";
            formLogin.parentElement.style.visibility = "visible";
            formRegistro.parentElement.style.visibility = "visible";
            loginLink.textContent = "Iniciar Sesión";
            loginLink.setAttribute("href", "Login.html");
            
        }
    }

    addEventListeners() {
        const loginForm = document.querySelector("form");
        const loginLink = document.querySelector("nav ul li a[href='Login.html']");
        
        if (loginForm) {
            loginForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const user = document.getElementById("user").value;
                const password = document.getElementById("password").value;
                this.login(user,password);
            });
        }

        loginLink.addEventListener("click", (event) => {
            if (this.user) {
                event.preventDefault();
                this.logout();
            }
        });
    }
}

new Auth();