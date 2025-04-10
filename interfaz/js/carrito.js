class Carrito {
    constructor() {
        
        this.carrito = this.obtenerCarrito();
        this.contenedorCarrito = document.getElementById("carritoProductos");
        this.mostrarCarrito();
        this.totalPagar = document.getElementById("totalPagar");
        this.btnComprar = document.getElementById("btnComprar");
        this.btnVaciar = document.getElementById("btnVaciar");
        this.agregarEventos();
    }

    obtenerCarrito() {
        return JSON.parse(localStorage.getItem("carrito")) || [];
    }

    guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
    }

    mostrarCarrito() {
        this.contenedorCarrito.innerHTML = "";
        let total = 0;

        if (this.carrito.length === 0) {
            this.contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
            this.totalPagar.textContent = "S/. 0.00";
            return;
        }

        this.carrito.forEach((item, index) => {

            const productoDiv  = `
                <div class='carrito-productos-image'>
                    <img src="${item.imagen}" alt="${item.descripcionCorta}">
                </div>
                <div class='carrito-productos-data'>
                    <h2 class="carrito-productos-data-nombre">${item.nombre}</h2>
                    <p>
                        <label class="carrito-productos-data-label">Descripción: </label> ${item.descripcionCorta}<br>
                        <label class="carrito-productos-data-label">Precio: </label>S/. ${item.precio}<br>
                        <label class="carrito-productos-data-label">Cantidad: </label> ${item.cantidad}<br>
                        <label class="carrito-productos-data-label">Total: </label>S/. ${(item.cantidad * item.precio).toFixed(2)}<br>
 
                        <button class="carrito-productos-data-button-editar" data-index="${index}">Editar</button>
                        <button class="carrito-productos-data-button-eliminar" data-index="${index}">Eliminar</button>
                    </p>
                </div>
            `;

            total += item.cantidad * item.precio;
            this.contenedorCarrito.innerHTML+=productoDiv;
        });

        const totalCalculado = `
            <div class="carrito-productos-total">
                <label class="carrito-productos-total-label">Total a Pagar: </label>
                <span id="totalPagar" class="carrito-productos-total-monto">S/. ${total.toFixed(2)}</span>
                <button id="btnComprar" class="carrito-productos-total-button-comprar">Comprar</button>
                <button id="btnVaciar" class="carrito-productos-total-button-eliminar">Cancelar</button>
            </div>`;
        this.contenedorCarrito.innerHTML+=totalCalculado;
    }

    agregarEventos() {
        this.contenedorCarrito.addEventListener("click", (e) => {
            if (e.target.classList.contains("carrito-productos-data-button-editar")) {
                const index = e.target.getAttribute("data-index");
                this.elditarItem(index);
            }
        });

        this.contenedorCarrito.addEventListener("click", (e) => {
            if (e.target.classList.contains("carrito-productos-data-button-eliminar")) {
                const index = e.target.getAttribute("data-index");
                this.eliminarItem(index);
            }
        });

        this.btnVaciar.addEventListener("click", () => {
            this.vaciarCarrito();
        });

        this.btnComprar.addEventListener("click", async () => {
            const usuario = JSON.parse(localStorage.getItem("user"));
            const carrito = JSON.parse(localStorage.getItem("carrito"));
            console.log("ingresando a comprar carrito");
            // Verificar si el usuario está logueado
            if (!usuario) {
                alert("Debes iniciar sesión para realizar una compra.");
                window.location.href = "login.html"; // Ajusta la ruta si es distinta
                return;
            }
        
            // Verificar que el carrito no esté vacío
            if (!carrito || carrito.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
        
            // Armar el cuerpo del pedido
            const productos = carrito.map(item => ({
                idProducto: item.idProducto,
                cantidad: item.cantidad,
                precioUnitario: parseFloat(item.precio)
            }));
        
            try {
                console.log("consumiendo servicio: http://localhost:3000/api/pedidos");
                const response = await fetch("http://localhost:3000/api/pedidos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        idCliente: usuario.idCliente,
                        productos: productos
                    })
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    alert("Compra realizada con éxito. Gracias por tu pedido.");
                    this.vaciarCarrito();
                    window.location.href = "productos.html"; // O la página que desees
                } else {
                    alert("Error al realizar la compra: " + result.mensaje);
                }
            } catch (error) {
                console.error("Error al registrar el pedido:", error);
                alert("Ocurrió un error inesperado al realizar la compra.");
            }
        });
        

    }

    eliminarItem(index) {
        this.carrito.splice(index, 1);
        this.guardarCarrito();
        this.mostrarCarrito();
    }

    elditarItem(index) {
        localStorage.removeItem('productoSeleccionado');
        localStorage.setItem('productoSeleccionado', JSON.stringify(this.carrito[index])); 
        window.location.href = `DetalleProducto.html`; 
    }

    vaciarCarrito() {
        this.carrito = [];
        this.guardarCarrito();
        this.mostrarCarrito();
    }
}

document.addEventListener("DOMContentLoaded", () => new Carrito());
