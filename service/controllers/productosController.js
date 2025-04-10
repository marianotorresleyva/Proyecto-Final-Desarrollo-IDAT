// controllers/clientesController.js
const pool = require('../conexion/db');

// Validaciones
const validarProducto = (producto) => {
  const errores = [];

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{3,}$/.test(producto.nombre)) {
    errores.push("El nombre debe tener al menos 3 caracteres y solo letras, números o espacios.");
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{3,}$/.test(producto.categoria)) {
    errores.push("La categoría debe tener al menos 3 letras y solo contener letras y espacios.");
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{3,}$/.test(producto.empresaAsociada)) {
    errores.push("La empresa asociada debe tener al menos 3 letras y solo contener letras y espacios.");
  }

  if (isNaN(producto.precio) || producto.precio <= 0) {
    errores.push("El precio debe ser un número mayor que 0.");
  }

  if (!Number.isInteger(producto.cantidadDisponible) || producto.cantidadDisponible < 0) {
    errores.push("La cantidad disponible debe ser un número entero mayor o igual a 0.");
  }

  if (isNaN(producto.puntuacion) || producto.puntuacion < 0 || producto.puntuacion > 5) {
    errores.push("La puntuación debe estar entre 0 y 5.");
  }

  return errores;
};

// GET todos los productos
exports.getProductos = async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT * FROM productos ORDER BY idProducto');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET producto por código
exports.getProductoPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE codigo = ?', [codigo]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST individual
exports.createProducto = async (req, res) => {
  const producto = req.body;
  const errores = validarProducto(producto);

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO productos 
        (codigo, nombre, categoria, empresaAsociada, descripcionCorta, descripcionLarga, imagenProducto, precio, cantidadDisponible, puntuacion, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        producto.codigo,
        producto.nombre,
        producto.categoria,
        producto.empresaAsociada,
        producto.descripcionCorta,
        producto.descripcionLarga,
        producto.imagenProducto,
        producto.precio,
        producto.cantidadDisponible,
        producto.puntuacion,
        producto.imagen,
      ]
    );
    res.status(201).json({ success: true, idProducto: result.insertId, ...producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST masivo
exports.createProductosMasivo = async (req, res) => {
  const productos = req.body.productos;
  if (!Array.isArray(productos)) {
    return res.status(400).json({ success: false, mensaje: "Se esperaba un arreglo de productos" });
  }

  const errores = [];
  const valores = [];

  productos.forEach((producto, index) => {
    const errorProducto = validarProducto(producto);
    if (errorProducto.length > 0) {
      errores.push({ producto: index + 1, errores: errorProducto });
    } else {
      valores.push([
        producto.codigo,
        producto.nombre,
        producto.categoria,
        producto.empresaAsociada,
        producto.descripcionCorta,
        producto.descripcionLarga,
        producto.imagenProducto,
        producto.precio,
        producto.cantidadDisponible,
        producto.puntuacion,
        producto.imagen,
      ]);
    }
  });

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }

  try {
    await pool.query(
      `INSERT INTO productos 
        (codigo, nombre, categoria, empresaAsociada, descripcionCorta, descripcionLarga, imagenProducto, precio, cantidadDisponible, puntuacion, imagen)
       VALUES ?`, [valores]);
    res.status(201).json({ success: true, message: "Productos insertados exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// PATCH individual (actualización parcial)
exports.actualizarProducto = async (req, res) => {
  const { codigo } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ success: false, mensaje: 'No se proporcionaron campos para actualizar' });
  }

  // Validación regex para los campos enviados
  const errores = [];
  if (campos.nombre && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{3,100}$/.test(campos.nombre)) {
    errores.push('El nombre debe tener entre 3 y 100 caracteres, solo letras, números y espacios');
  }
  if (campos.categoria && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{3,50}$/.test(campos.categoria)) {
    errores.push('La categoría debe tener entre 3 y 50 caracteres, solo letras, números y espacios');
  }
  if (campos.descripcionCorta && campos.descripcionCorta.length > 255) {
    errores.push('La descripción corta no debe superar los 255 caracteres');
  }
  if (campos.precio && (isNaN(campos.precio) || campos.precio <= 0)) {
    errores.push('El precio debe ser un número positivo');
  }
  if (campos.cantidadDisponible && (isNaN(campos.cantidadDisponible) || campos.cantidadDisponible < 0)) {
    errores.push('La cantidad debe ser un número igual o mayor a 0');
  }
  if (campos.puntuacion && (isNaN(campos.puntuacion) || campos.puntuacion < 0 || campos.puntuacion > 5)) {
    errores.push('La puntuación debe estar entre 0 y 5');
  }

  if (errores.length > 0) {
    return res.status(400).json({ success: false, errores });
  }

  try {
    const camposSet = [];
    const valores = [];

    for (const [key, value] of Object.entries(campos)) {
      camposSet.push(`${key} = ?`);
      valores.push(value);
    }

    valores.push(codigo); // Último valor es el del WHERE

    const [result] = await pool.query(
      `UPDATE productos SET ${camposSet.join(', ')} WHERE codigo = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Producto no encontrado' });
    }

    res.json({ success: true, mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
