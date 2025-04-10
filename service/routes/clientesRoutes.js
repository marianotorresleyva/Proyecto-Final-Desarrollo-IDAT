const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

// Rutas para consultar clientes
router.get('/', clientesController.getAllClientes); // Obtener todos los clientes
router.get('/:id', clientesController.getClienteById); // Obtener un cliente por ID

// Rutas para crear clientes
router.post('/masivo', clientesController.createMultipleClientes); // Crear clientes masivos
router.post('/', clientesController.createCliente); // Crear cliente individual

// Rutas para actualizar clientes
router.put('/masivo', clientesController.updateMultipleClientes); // Actualizar clientes masivos
router.put('/:id', clientesController.updateCliente); // Actualizar cliente individual

// Rutas para actualizar parcialmente clientes
router.patch('/masivo', clientesController.patchMultipleClientes); // Actualizar parcialmente clientes masivos
router.patch('/:id', clientesController.patchCliente); // Actualizar parcialmente cliente individual

// Rutas para eliminar clientes
router.delete('/masivo', clientesController.deleteMultipleClientes); // Eliminar clientes masivos
router.delete('/:id', clientesController.deleteCliente); // Eliminar cliente individual

// Rutas para gestionar usuarios
router.post('/usuarios', clientesController.createUsuario); // Registrar usuario individual
router.post('/usuarios/masivo', clientesController.createMultipleUsuarios); // Registrar usuarios masivos

// Rutas para actualizar la contraseña de un usuario
router.put('/usuarios/:id/password', clientesController.updatePassword); // Actualizar contraseña de usuario

// Ruta para eliminar un usuario
router.delete('/usuarios/:id', clientesController.deleteUsuario); // Eliminar usuario

module.exports = router;
