// controllers/clientesController.js
const pool = require('../conexion/db');
const bcrypt = require('bcryptjs');

// GET login de usuario con validación
exports.loginUsuario = async (req, res) => {
    const { nomUsuario, password } = req.query;

    if (!nomUsuario || !password) {
        return res.status(400).json({
            success: false,
            mensaje: "Se requieren nomUsuario y password como parámetros",
        });
    }

    let errors = [];
    const regexUsuario = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!regexUsuario.test(nomUsuario)) errors.push("El usuario no tiene un formato válido");
    if (!regexPassword.test(password)) errors.push("La contraseña debe ser segura (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errores: errors });
    }


    try {
        const [usuarios] = await pool.query(
            `SELECT u.idUsuarios, u.idCliente, u.nomUsuario, u.password, r.descripcion AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.idRol = r.idRol
             WHERE u.nomUsuario = ?`,
            [nomUsuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                mensaje: "Usuario no encontrado",
            });
        }

        const usuario = usuarios[0];
        const match = await bcrypt.compare(password, usuario.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                mensaje: "Contraseña incorrecta",
            });
        }

        res.json({
            success: true,
            usuario: {
                id: usuario.idUsuarios,
                idCliente: usuario.idCliente,
                nomUsuario: usuario.nomUsuario,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error en el login", error: error.message });
    }
};
