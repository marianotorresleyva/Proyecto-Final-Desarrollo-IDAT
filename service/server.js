const express = require('express');
const cors = require('cors');
const app = express();

const rolesRoutes = require('./routes/rolesRoutes');
const clientesRoutes = require('./routes/clientesRoutes'); // Asegúrate de ajustar la ruta correctamente
const loginRouters = require('./routes/loginRouters');
const productosRoutes = require('./routes/productosRoutes');
const pedidoRouters = require('./routes/pedidoRouters');
// Permitir todas las solicitudes (modo desarrollo)
app.use(cors());

// O bien, para producción, especifica los orígenes permitidos:
// app.use(cors({
//   origin: 'http://localhost:5500' // Cambia esto por tu dominio o ruta local
// }));


app.use(express.json());
app.use('/api/roles', rolesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/login', loginRouters);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidoRouters);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
