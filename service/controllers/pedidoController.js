// controllers/clientesController.js
const pool = require('../conexion/db');

// POST: Registrar un pedido
exports.registrarPedido = async (req, res) => {
  const { idCliente, productos } = req.body; // El cliente y los productos vienen en el body de la solicitud
  const errores = [];

  // Validaciones (ejemplo básico)
  if (!idCliente || productos.length === 0) {
    return res.status(400).json({ success: false, mensaje: 'Cliente y productos son necesarios.' });
  }

  // Inicia la transacción
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    // Verificar disponibilidad de productos
    for (let producto of productos) {
      const [productoDisponible] = await connection.query(
        'SELECT cantidadDisponible FROM productos WHERE idProducto = ?',
        [producto.idProducto]
      );
      
      if (productoDisponible.length === 0 || productoDisponible[0].cantidadDisponible < producto.cantidad) {
        // Si el producto no está disponible o la cantidad es insuficiente
        throw new Error(`Producto ${producto.idProducto} no tiene suficiente stock disponible.`);
      }
    }

    // Registrar el pedido en la tabla Pedido
    const [resultPedido] = await connection.query(
      'INSERT INTO Pedido (idCliente, total) VALUES (?, ?)',
      [idCliente, calcularTotal(productos)]
    );
    const idPedido = resultPedido.insertId;

    // Registrar los detalles del pedido en la tabla DetallePedido
    for (let producto of productos) {
      const subtotal = producto.cantidad * producto.precioUnitario;

      // Insertar el detalle del pedido
      await connection.query(
        'INSERT INTO DetallePedido (idPedido, idProducto, cantidad, precioUnitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [idPedido, producto.idProducto, producto.cantidad, producto.precioUnitario, subtotal]
      );

      // Actualizar la cantidad disponible en productos
      await connection.query(
        'UPDATE productos SET cantidadDisponible = cantidadDisponible - ? WHERE idProducto = ?',
        [producto.cantidad, producto.idProducto]
      );
    }

    // Si todo está bien, confirmar la transacción
    await connection.commit();

    res.json({ success: true, mensaje: 'Pedido registrado exitosamente', idPedido });
  } catch (error) {
    // Si algo falla, revertir la transacción
    await connection.rollback();
    res.status(500).json({ success: false, mensaje: error.message });
  } finally {
    // Liberar la conexión
    connection.release();
  }
};

// Función para calcular el total del pedido
function calcularTotal(productos) {
  return productos.reduce((total, producto) => total + (producto.cantidad * producto.precioUnitario), 0).toFixed(2);
}
