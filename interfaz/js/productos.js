// Clase Producto
class Producto {
  constructor(data) {
    this.idProducto = data.idProducto;
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

  crearElementoHTML() {
    const productoDiv = document.createElement('div');
    productoDiv.className = 'producto';

    const nombre = document.createElement('h2');
    nombre.textContent = this.nombre;

    const imagen = document.createElement('img');
    imagen.src = this.imagen;
    imagen.alt = this.nombre;
    imagen.className = 'img-producto';

    const descripcion = document.createElement('p');
    descripcion.innerHTML = `
      <span class="producto-spam">Descripción:</span> ${this.descripcionCorta}<br/>
      <span class="producto-spam">Precio:</span> S/. ${this.precio}<br/>
      <span class="producto-spam">Puntuación:</span> ${this.puntuacion}<br/>
    `;

    const botonComprar = document.createElement('button');
    botonComprar.className = 'producto-button';
    botonComprar.textContent = 'Comprar';
    botonComprar.addEventListener('click', () => {
      localStorage.removeItem('productoSeleccionado');
      localStorage.setItem('productoSeleccionado', JSON.stringify(this)); 
      window.location.href = `DetalleProducto.html`; 
    });

    productoDiv.appendChild(nombre);
    productoDiv.appendChild(imagen);
    productoDiv.appendChild(descripcion);
    productoDiv.appendChild(botonComprar);

    return productoDiv;
  }
}

class ListaProductos {
  constructor(contenedorId) {
    this.contenedor = document.getElementById(contenedorId);
  }

  async obtenerProductos() {
    try {
      // Consulta al servicio GET de productos
      const response = await fetch('http://localhost:3000/api/productos');
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar los productos');
      }

      const productosData = await response.json();

      // Crea los objetos Producto a partir de los datos obtenidos
      const productos = productosData.map(productoData => new Producto(productoData));

      // Muestra los productos
      this.mostrarProductos(productos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  }

  mostrarProductos(productos) {
    // Limpia el contenedor antes de agregar los nuevos productos
    this.contenedor.innerHTML = '';

    productos.forEach(producto => {
      const productoElemento = producto.crearElementoHTML();
      this.contenedor.appendChild(productoElemento);
    });
  }
}

// Espera que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const listaProductos = new ListaProductos('contenedor-productos');
  listaProductos.obtenerProductos();
});
