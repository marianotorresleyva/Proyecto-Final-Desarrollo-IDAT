create database carrito

-- Crear tabla clientes
CREATE TABLE clientes (
    idCliente BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla roles
CREATE TABLE roles (
    idRol SMALLINT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);

-- Crear tabla usuarios
CREATE TABLE usuarios (
    idUsuarios BIGINT AUTO_INCREMENT PRIMARY KEY,
    idCliente BIGINT NOT NULL,
    idRol smallint NOT NULL,
    nomUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCliente) REFERENCES clientes(idCliente),
    FOREIGN KEY (idRol) REFERENCES roles(idRol)
);

-- Crear tabla productos
CREATE TABLE productos (
    idProducto BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    empresaAsociada VARCHAR(100),
    descripcionCorta VARCHAR(255),
    descripcionLarga TEXT,
    imagenProducto VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    cantidadDisponible INT DEFAULT 0 CHECK (cantidadDisponible >= 0),
    puntuacion DECIMAL(2,1) DEFAULT 0.0 CHECK (puntuacion >= 0),
    imagen VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Pedido
CREATE TABLE Pedido (
    idPedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    idCliente BIGINT NOT NULL,
    fechaPedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Enviado', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    total DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (idCliente) REFERENCES clientes(idCliente) ON DELETE CASCADE
);

-- Crear tabla DetallePedido
CREATE TABLE DetallePedido (
    idDetalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    idPedido BIGINT NOT NULL,
    idProducto BIGINT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioUnitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES productos(idProducto) ON DELETE CASCADE
);



INSERT INTO roles (descripcion) VALUES 
('Administrador'),
('Desarrollador'),
('Cliente');


INSERT INTO productos (codigo, nombre, categoria, empresaAsociada, descripcionCorta, descripcionLarga, imagenProducto, precio, cantidadDisponible, puntuacion, imagen)
VALUES 
('001', 'Smartphone Samsung Galaxy S21', 'Electrónica', 'Samsung', 'Smartphone de alta gama', 'Smartphone Samsung Galaxy S21 con pantalla AMOLED de 6.2 pulgadas, cámara de 64 MP, procesador Exynos 2100, 8 GB de RAM y 128 GB de almacenamiento.', 'samsung-galaxy-s21.jpg', 2999.99, 50, 4.5, './Imagenes/productos/1.jpg'),
('002', 'Laptop HP Pavilion', 'Computadoras', 'HP', 'Laptop con gran rendimiento', 'Laptop HP Pavilion con pantalla Full HD de 15.6 pulgadas, procesador Intel Core i5, 16 GB de RAM y 512 GB de SSD, ideal para trabajar y estudiar.', 'hp-pavilion-laptop.jpg', 2499.99, 30, 4.2, './Imagenes/productos/2.jpg'),
('003', 'Televisor Sony Bravia 4K', 'Electrónica', 'Sony', 'Televisor 4K con colores vibrantes', 'Televisor Sony Bravia 4K con pantalla LED de 55 pulgadas, resolución 4K, tecnología HDR, Smart TV y sonido envolvente Dolby Atmos.', 'sony-bravia-4k.jpg', 1699.99, 25, 4.7, './Imagenes/productos/3.jpg'),
('004', 'Refrigeradora LG Inverter', 'Electrodomésticos', 'LG', 'Refrigeradora eficiente energéticamente', 'Refrigeradora LG Inverter con capacidad de 25 pies cúbicos, tecnología Inverter, dispensador de agua y hielo, y control de temperatura inteligente.', 'lg-inverter-refrigerator.jpg', 1799.99, 15, 4.4, './Imagenes/productos/4.jpg'),
('005', 'Zapatillas Nike Air Max', 'Ropa y Calzado', 'Nike', 'Zapatillas deportivas de estilo', 'Zapatillas Nike Air Max con diseño moderno, suela con amortiguación Air Max, ideales para actividades deportivas y uso diario.', 'nike-air-max-shoes.jpg', 129.99, 100, 4.8, './Imagenes/productos/5.jpg'),
('006', 'Mesa de Comedor de Madera', 'Muebles', 'Muebles Perú', 'Mesa de comedor elegante', 'Mesa de comedor de madera maciza con capacidad para 6 personas, acabado de alta calidad y diseño elegante para tu hogar.', 'wooden-dining-table.jpg', 499.99, 10, 4.6, './Imagenes/productos/6.jpg'),
('007', 'Bicicleta de Montaña Trek', 'Deportes y Aventura', 'Trek Bikes', 'Bicicleta todoterreno', 'Bicicleta de montaña Trek con cuadro de aluminio, suspensión delantera, cambios Shimano y frenos de disco hidráulicos, perfecta para rutas fuera de carretera.', 'trek-mountain-bike.jpg', 899.99, 20, 4.9, './Imagenes/productos/7.jpg'),
('008', 'Set de Maletas Samsonite', 'Equipaje y Viajes', 'Samsonite', 'Set de maletas de alta calidad', 'Set de maletas Samsonite que incluye una maleta grande, una maleta mediana y una maleta de mano con ruedas giratorias, duraderas y resistentes.', 'samsonite-luggage-set.jpg', 329.99, 40, 4.7, './Imagenes/productos/8.jpg'),
('009', 'Cafetera Nespresso', 'Electrodomésticos', 'Nespresso', 'Máquina de café espresso', 'Cafetera Nespresso con sistema de cápsulas, preparación de café espresso y cappuccino, diseño compacto y elegante para tu cocina.', 'nespresso-coffee-machine.jpg', 199.99, 30, 4.6, './Imagenes/productos/9.jpg'),
('010', 'Libro \"Cien Años de Soledad\"', 'Libros', 'Editorial García Márquez', 'Novela clásica de Gabriel García Márquez', 'Libro \"Cien Años de Soledad\" del autor Gabriel García Márquez, considerada una de las obras literarias más importantes del siglo XX.', 'cien-anos-de-soledad-book.jpg', 24.99, 80, 4.9, './Imagenes/productos/10.jpg'),
('011', 'Reloj Casio G-Shock', 'Relojes', 'Casio', 'Reloj resistente a golpes', 'Reloj Casio G-Shock resistente a golpes, resistente al agua hasta 200 metros, con cronómetro, alarma y luz LED.', 'casio-g-shock-watch.jpg', 99.99, 60, 4.5, './Imagenes/productos/11.jpg'),
('012', 'Máquina de Ejercicios Bowflex', 'Fitness y Deportes', 'Bowflex', 'Equipo de entrenamiento en casa', 'Máquina de ejercicios Bowflex con múltiples configuraciones para ejercitar todo el cuerpo, resistencia ajustable y pantalla LCD para seguimiento de progreso.', 'bowflex-exercise-machine.jpg', 699.99, 15, 4.7, './Imagenes/productos/12.jpg');





