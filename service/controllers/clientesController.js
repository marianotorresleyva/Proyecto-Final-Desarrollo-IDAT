// controllers/clientesController.js
const pool = require('../conexion/db');
const bcrypt = require('bcryptjs');

// GET todos los clientes con usuarios
exports.getAllClientes = async (req, res) => {
    try {
        const [clientes] = await pool.query('SELECT * FROM clientes');

        for (const cliente of clientes) {
            const [usuarios] = await pool.query('SELECT idUsuarios, idRol, nomUsuario, fecCreacion FROM usuarios WHERE idCliente = ?', [cliente.idCliente]);
            cliente.usuarios = usuarios;
        }

        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes', details: error.message });
    }
};

// GET cliente por ID con usuarios
exports.getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const [clientes] = await pool.query('SELECT * FROM clientes WHERE idCliente = ?', [id]);
        if (clientes.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

        const cliente = clientes[0];
        const [usuarios] = await pool.query('SELECT idUsuarios, idRol, nomUsuario, fecCreacion FROM usuarios WHERE idCliente = ?', [id]);
        cliente.usuarios = usuarios;

        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cliente', details: error.message });
    }
};

// POST cliente individual con usuario
exports.createCliente = async (req, res) => {
    const { nombre, apellido, email, telefono, direccion, usuario } = req.body;
    let errors = [];
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!regexEmail.test(email)) errors.push("El email no tiene un formato válido");
    if (!regexPassword.test(usuario.password)) errors.push("La contraseña debe ser segura (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errores: errors });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        // Verificar si el correo electrónico ya existe en la base de datos
        const [existingClient] = await connection.query(
            'SELECT * FROM clientes WHERE email = ?',
            [email]
        );

        if (existingClient.length > 0) {
            await connection.rollback();  // Rollback de la transacción si el correo ya existe
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Verificar si el nombre de usuario ya existe en la base de datos
        const [existingUser] = await connection.query(
            'SELECT * FROM usuarios WHERE nomUsuario = ?',
            [usuario.nomUsuario]
        );

        if (existingUser.length > 0) {
            await connection.rollback();  // Rollback de la transacción si el nombre de usuario ya existe
            return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
        }

        // Insertamos nuevo cliente
        const [clienteResult] = await connection.query(
            'INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, email, telefono, direccion]
        );

        const hashedPassword = await bcrypt.hash(usuario.password, 10);

        await connection.query(
            'INSERT INTO usuarios (idCliente, idRol, nomUsuario, password) VALUES (?, ?, ?, ?)',
            [clienteResult.insertId, usuario.idRol, usuario.nomUsuario, hashedPassword]
        );

        await connection.commit();
        res.status(201).json({ message: 'Cliente y usuario registrados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al registrar cliente y usuario', details: error.message });
    } finally {
        connection.release();
    }
};

// POST masivo de clientes con usuarios
exports.createMultipleClientes = async (req, res) => {
    const clientes = req.body.clientes;
    let errors = [];
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    for (const c of clientes) {
        if (!regexEmail.test(c.email)) errors.push("El email no tiene un formato válido");
        if (!regexPassword.test(c.usuario.password)) errors.push("La contraseña debe ser segura (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)");
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errores: errors });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();
        for (const c of clientes) {
            // Verificar si el correo electrónico ya existe en la base de datos
            const [existingClient] = await connection.query(
                'SELECT * FROM clientes WHERE email = ?',
                [c.email]
            );

            if (existingClient.length > 0) {
                await connection.rollback();  // Rollback de la transacción si el correo ya existe
                return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
            }

            // Verificar si el nombre de usuario ya existe en la base de datos
            const [existingUser] = await connection.query(
                'SELECT * FROM usuarios WHERE nomUsuario = ?',
                [c.usuario.nomUsuario]
            );

            if (existingUser.length > 0) {
                await connection.rollback();  // Rollback de la transacción si el nombre de usuario ya existe
                return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
            }
        }

        for (const c of clientes) {
            const [clienteResult] = await connection.query(
                'INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
                [c.nombre, c.apellido, c.email, c.telefono, c.direccion]
            );

            const hashedPassword = await bcrypt.hash(c.usuario.password, 10);

            await connection.query(
                'INSERT INTO usuarios (idCliente, idRol, nomUsuario, password) VALUES (?, ?, ?, ?)',
                [clienteResult.insertId, c.usuario.idRol, c.usuario.nomUsuario, hashedPassword]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Clientes y usuarios registrados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al registrar clientes', details: error.message });
    } finally {
        connection.release();
    }
};


// controllers/clientesController.js (continuación)

// PUT cliente individual con usuario
exports.updateCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        const [result] = await connection.query(
            'UPDATE clientes SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE idCliente = ?',
            [nombre, apellido, email, telefono, direccion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
    } finally {
        connection.release();
    }
};

// PUT masivo de clientes
exports.updateMultipleClientes = async (req, res) => {
    const clientes = req.body.clientes;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        for (const c of clientes) {
            await connection.query(
                'UPDATE clientes SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE idCliente = ?',
                [c.nombre, c.apellido, c.email, c.telefono, c.direccion, c.idCliente]
            );
        }

        await connection.commit();
        res.json({ message: 'Clientes actualizados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar clientes', details: error.message });
    } finally {
        connection.release();
    }
};

// PATCH cliente individual con usuario
exports.patchCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        if (nombre) {
            await connection.query(
                'UPDATE clientes SET nombre = ? WHERE idCliente = ?',
                [nombre, id]
            );
        }
        if (apellido) {
            await connection.query(
                'UPDATE clientes SET apellido = ? WHERE idCliente = ?',
                [apellido, id]
            );
        }
        if (email) {
            await connection.query(
                'UPDATE clientes SET email = ? WHERE idCliente = ?',
                [email, id]
            );
        }
        if (telefono) {
            await connection.query(
                'UPDATE clientes SET telefono = ? WHERE idCliente = ?',
                [telefono, id]
            );
        }
        if (direccion) {
            await connection.query(
                'UPDATE clientes SET direccion = ? WHERE idCliente = ?',
                [direccion, id]
            );
        }

        await connection.commit();
        res.json({ message: 'Cliente actualizado parcialmente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
    } finally {
        connection.release();
    }
};

// PATCH masivo de clientes
exports.patchMultipleClientes = async (req, res) => {
    const clientes = req.body.clientes;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        for (const c of clientes) {
            if (c.nombre) {
                await connection.query(
                    'UPDATE clientes SET nombre = ? WHERE idCliente = ?',
                    [c.nombre, c.idCliente]
                );
            }
            if (c.apellido) {
                await connection.query(
                    'UPDATE clientes SET apellido = ? WHERE idCliente = ?',
                    [c.apellido, c.idCliente]
                );
            }
            if (c.email) {
                await connection.query(
                    'UPDATE clientes SET email = ? WHERE idCliente = ?',
                    [c.email, c.idCliente]
                );
            }
            if (c.telefono) {
                await connection.query(
                    'UPDATE clientes SET telefono = ? WHERE idCliente = ?',
                    [c.telefono, c.idCliente]
                );
            }
            if (c.direccion) {
                await connection.query(
                    'UPDATE clientes SET direccion = ? WHERE idCliente = ?',
                    [c.direccion, c.idCliente]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Clientes actualizados parcialmente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar clientes', details: error.message });
    } finally {
        connection.release();
    }
};

// DELETE cliente individual con usuarios
exports.deleteCliente = async (req, res) => {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        // Primero eliminamos los usuarios del cliente
        await connection.query('DELETE FROM usuarios WHERE idCliente = ?', [id]);

        // Ahora eliminamos al cliente
        const [result] = await connection.query('DELETE FROM clientes WHERE idCliente = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Cliente y sus usuarios eliminados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al eliminar cliente', details: error.message });
    } finally {
        connection.release();
    }
};

// DELETE masivo de clientes con usuarios
exports.deleteMultipleClientes = async (req, res) => {
    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Se espera un arreglo de IDs' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        // Primero eliminamos los usuarios de los clientes
        await connection.query('DELETE FROM usuarios WHERE idCliente IN (?)', [ids]);

        // Luego eliminamos a los clientes
        await connection.query('DELETE FROM clientes WHERE idCliente IN (?)', [ids]);

        await connection.commit();
        res.json({ message: 'Clientes y sus usuarios eliminados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al eliminar clientes', details: error.message });
    } finally {
        connection.release();
    }
};

// POST usuario individual
exports.createUsuario = async (req, res) => {
    const { idCliente, idRol, nomUsuario, password } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO usuarios (idCliente, idRol, nomUsuario, password) VALUES (?, ?, ?, ?)',
            [idCliente, idRol, nomUsuario, hashedPassword]
        );

        await connection.commit();
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
    } finally {
        connection.release();
    }
};

// POST masivo de usuarios
exports.createMultipleUsuarios = async (req, res) => {
    const usuarios = req.body.usuarios;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        for (const u of usuarios) {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            await connection.query(
                'INSERT INTO usuarios (idCliente, idRol, nomUsuario, password) VALUES (?, ?, ?, ?)',
                [u.idCliente, u.idRol, u.nomUsuario, hashedPassword]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Usuarios registrados correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al registrar usuarios', details: error.message });
    } finally {
        connection.release();
    }
};

// UPDATE contraseña de usuario
exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    let errors = [];
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!regexPassword.test(password)) errors.push("La contraseña debe ser segura (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)");

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errores: errors });
    }

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'UPDATE usuarios SET password = ? WHERE idUsuarios = ?',
            [hashedPassword, id]
        );

        await connection.commit();
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar contraseña', details: error.message });
    } finally {
        connection.release();
    }
};

// DELETE usuario
exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
        await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        await connection.beginTransaction();

        const [result] = await connection.query('DELETE FROM usuarios WHERE idUsuarios = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
    } finally {
        connection.release();
    }
};
