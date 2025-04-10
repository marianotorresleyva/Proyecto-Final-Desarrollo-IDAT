const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.getProductos);
router.get('/:codigo', productosController.getProductoPorCodigo);
router.post('/', productosController.createProducto);
router.post('/masivo', productosController.createProductosMasivo);
router.patch('/:codigo', productosController.actualizarProducto);

module.exports = router;