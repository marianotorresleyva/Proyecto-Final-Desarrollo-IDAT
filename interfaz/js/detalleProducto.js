// Clase Producto
class Producto {
    constructor(data) {
        this.codigo = data.codigo;
        this.nombre = data.nombre;
        this.categoria = data.categoria;
        this.empresaAsociada = data.empresaAsociada;
        this.descripcionCorta = data.descripcionCorta;
        this.descripcionLarga = data.descripcionLarga;
        this.imagenProducto = data.imagenProducto;
        this.precio = data.precio;
        this.cantidadDisponible = data.cantidadDisponible;
        this.puntuacion = data.puntuacion;
        this.imagen = data.imagen;
    }
}

// Clase para manejar la página de detalle
class DetalleProducto {
    constructor() {
        this.producto = this.obtenerProducto();
        this.cantidadInput = document.getElementById('cantidad');
        this.stockError = document.getElementById('stockError');
        this.totalSpan = document.getElementById('totalProducto');
        this.btnAgregar = document.getElementById('btnAgregar');
        this.btnCancelar = document.getElementById('btnCancelar');

        if (this.producto) {
            this.mostrarDetalles();
            this.agregarEventos();
        } else {
            console.error("No se encontró el producto en localStorage.");
        }
    }

    obtenerProducto() {
        const productoData = localStorage.getItem('productoSeleccionado');
        return productoData ? new Producto(JSON.parse(productoData)) : null;
    }

    mostrarDetalles() {
        document.getElementById('nombreProducto').textContent = this.producto.nombre;
        document.getElementById('imagenProducto').src = this.producto.imagen;
        document.getElementById('imagenProducto').alt = this.producto.descripcionCorta;
        document.getElementById('descripcionProducto').textContent = this.producto.descripcionLarga;
        document.getElementById('categoriaProducto').textContent = this.producto.categoria;
        document.getElementById('empresaProducto').textContent = this.producto.empresaAsociada;
        document.getElementById('stockProducto').textContent = this.producto.cantidadDisponible;
        document.getElementById('precioProducto').textContent = `S/. ${this.producto.precio}`;
        document.getElementById('puntuacionProducto').textContent = this.producto.puntuacion;
        this.actualizarTotal();
    }

    actualizarTotal() {
        const cantidad = parseInt(this.cantidadInput.value);
        const total = cantidad * this.producto.precio;
        this.totalSpan.textContent = `S/. ${total.toFixed(2)}`;
    }

    validarStock() {
        const cantidad = parseInt(this.cantidadInput.value);
        if (cantidad > this.producto.cantidadDisponible) {
            this.stockError.textContent = "Stock insuficiente";
            return false;
        } else {
            this.stockError.textContent = "";
            return true;
        }
    }

    agregarEventos() {
        this.cantidadInput.addEventListener('input', () => {
            this.validarStock();
            this.actualizarTotal();
        });

        this.btnAgregar.addEventListener('click', () => {
        
            if (this.validarStock()) {
                const cantidad = parseInt(document.getElementById('cantidad').value);
                if (cantidad <= 0 || isNaN(cantidad)) {
                    alert("Seleccione una cantidad válida.");
                    return;
                }
            
                const productoData = JSON.parse(localStorage.getItem('productoSeleccionado'));
                if (!productoData) {
                    alert("Error al obtener el producto.");
                    return;
                }
            
                let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            
                // Buscar si el producto ya está en el carrito
                const indexExistente = carrito.findIndex(item => item.codigo === productoData.codigo);
            
                if (indexExistente !== -1) {
                    // El producto ya está en el carrito, preguntar si se reemplaza
                    const confirmar = confirm("El producto ya está en el carrito. ¿Deseas reemplazarlo?");
                    if (confirmar) {
                        carrito[indexExistente] = { ...productoData, cantidad };
                        alert("Producto actualizado correctamente.");
                        window.location.href = 'Carrito.html';
                    }
                } else {
                    // Si no está en el carrito, agregarlo
                    carrito.push({ ...productoData, cantidad });
                    alert("Producto agregado al carrito correctamente.");
                    window.location.href = 'Carrito.html';
                }
                localStorage.setItem("carrito", JSON.stringify(carrito));
                
            }else{
                alert("Stock Insuficiente"); // Aquí puedes añadir lógica real de carrito
            }
        });

        this.btnCancelar.addEventListener('click', () => {
            localStorage.removeItem('productoSeleccionado');
            window.location.href = 'Productos.html';
        });
    }
}

// Inicializa la página cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => new DetalleProducto());
