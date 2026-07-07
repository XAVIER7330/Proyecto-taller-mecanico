-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS taller_automotriz;
USE taller_automotriz;

-- 1. Tabla de Clientes
-- Nota: Se incluye 'cedula' para identificación oficial
CREATE TABLE Clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    email VARCHAR(100)
);

-- 2. Tabla de Vehículos
-- La placa actúa como identificador natural, pero usamos id_vehiculo para consistencia
CREATE TABLE Vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(15) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    anio INT,
    id_cliente INT,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE
);

-- 3. Tabla de Mecánicos
CREATE TABLE Mecanicos (
    id_mecanico INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(15) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(50)
);


-- 4. Tabla de Órdenes de Reparación
-- Controla el flujo principal y el estado actual
CREATE TABLE OrdenesReparacion (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM(
        'INGRESADO', 
        'EN_DIAGNOSTICO', 
        'ESPERANDO_APROBACION', 
        'EN_REPARACION', 
        'LISTO_PARA_ENTREGA', 
        'ENTREGADO'
    ) DEFAULT 'INGRESADO',
    costo_total DECIMAL(12, 2) DEFAULT 0.00,
    id_vehiculo INT,
    id_mecanico INT,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo),
    FOREIGN KEY (id_mecanico) REFERENCES Mecanicos(id_mecanico)
);

-- 5. Tabla de Diagnósticos
-- Relación 1:1 con la Orden de Reparación
CREATE TABLE Diagnosticos (
    id_diagnostico INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT UNIQUE,
    descripcion TEXT NOT NULL,
    observaciones TEXT,
    presupuesto_estimado DECIMAL(12, 2),
    FOREIGN KEY (id_orden) REFERENCES OrdenesReparacion(id_orden) ON DELETE CASCADE
);
-- 6. Tabla de Administradores
CREATE TABLE Administradores (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100)
);
-- 6b. Tabla de Oficinistas
CREATE TABLE Oficinistas (
    id_oficinista INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100)
);
-- 7. Tabla de Usuarios para autenticación
CREATE TABLE Usuarios(
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    passw VARCHAR(255),
    rol INT ,
    ultimo_acceso DATETIME,
    tkRef VARCHAR(255)
);

-- Insertar un cliente de prueba
INSERT INTO Clientes (cedula, nombre, telefono, email) VALUES 
('1-1234-5678', 'Juan Pérez', '8888-7777', 'juan.perez@email.com'),
('2-1234-5678', 'Wendolyn Vargas', '8888-7747', 'wendolyn.vargas@email.com'),
('3-1234-5678', 'Ana Luz', '8888-7737', 'ana.luz@email.com'),
('4-1234-5678', 'Carlos Mena', '8888-7727', 'carlos.mena@email.com'),
('5-1234-5678', 'Antonio Morales', '8888-7737', 'antonio.morales@email.com');

-- Insertar un vehículo
INSERT INTO Vehiculos (placa, marca, modelo, anio, id_cliente) 
VALUES ('BZC-123', 'Toyota', 'Corolla', 2022, 1);

-- Registrar un mecánico
INSERT INTO Mecanicos (cedula, nombre, especialidad) 
VALUES ('1-1234-5678', 'Carlos Solís', 'Motores y Transmisión');

-- 10 clientes adicionales
INSERT INTO Clientes (cedula, nombre, telefono, email) VALUES
('6-1234-5678', 'Laura Chaves', '8888-7711', 'laura.chaves@email.com'),
('7-1234-5678', 'Diego Araya', '8888-7712', 'diego.araya@email.com'),
('8-1234-5678', 'María González', '8888-7713', 'maria.gonzalez@email.com'),
('9-1234-5678', 'José Rojas', '8888-7714', 'jose.rojas@email.com'),
('10-1234-5678', 'Fernanda Mora', '8888-7715', 'fernanda.mora@email.com'),
('11-1234-5678', 'Ricardo Núñez', '8888-7716', 'ricardo.nunez@email.com'),
('12-1234-5678', 'Paola Campos', '8888-7717', 'paola.campos@email.com'),
('13-1234-5678', 'Esteban Segura', '8888-7718', 'esteban.segura@email.com'),
('14-1234-5678', 'Gabriela Soto', '8888-7719', 'gabriela.soto@email.com'),
('15-1234-5678', 'Mauricio León', '8888-7720', 'mauricio.leon@email.com');

-- 10 vehículos adicionales
INSERT INTO Vehiculos (placa, marca, modelo, anio, id_cliente) VALUES
('HJK-456', 'Honda', 'Civic', 2021, 2),
('LMN-789', 'Nissan', 'Sentra', 2020, 3),
('PRQ-321', 'Hyundai', 'Elantra', 2019, 4),
('STU-654', 'Kia', 'Rio', 2018, 5),
('VWX-987', 'Mazda', '3', 2022, 6),
('YZA-111', 'Ford', 'Focus', 2017, 7),
('BCD-222', 'Chevrolet', 'Cruze', 2016, 8),
('EFG-333', 'Volkswagen', 'Jetta', 2023, 9),
('HIJ-444', 'Subaru', 'Impreza', 2021, 10),
('KLM-555', 'Renault', 'Logan', 2019, 11);

-- 10 mecánicos adicionales
INSERT INTO Mecanicos (cedula, nombre, especialidad) VALUES
('2-1234-5678', 'Andrés Villalobos', 'Frenos'),
('3-1234-5678', 'Sofía Salazar', 'Electricidad automotriz'),
('4-1234-5678', 'Daniel Quesada', 'Suspensión'),
('5-1234-5678', 'Valeria Jiménez', 'Diagnóstico electrónico'),
('6-1234-5678', 'Javier Ramírez', 'Aire acondicionado'),
('7-1234-5678', 'Natalia Porras', 'Inyección'),
('8-1234-5678', 'Óscar Herrera', 'Transmisiones'),
('9-1234-5678', 'Camila Alvarado', 'Alineación y balanceo'),
('10-1234-5678', 'Pablo Ureña', 'Mantenimiento preventivo'),
('11-1234-5678', 'Elena Cordero', 'Motor diésel');

-- 10 órdenes de reparación de prueba
INSERT INTO OrdenesReparacion (fecha_entrada, estado, costo_total, id_vehiculo, id_mecanico) VALUES
('2026-03-01 08:15:00', 'EN_DIAGNOSTICO', 120000.00, 1, 1),
('2026-03-02 09:30:00', 'ESPERANDO_APROBACION', 85000.00, 2, 2),
('2026-03-03 10:45:00', 'EN_REPARACION', 230000.00, 3, 3),
('2026-03-04 11:00:00', 'LISTO_PARA_ENTREGA', 76000.00, 4, 4),
('2026-03-05 13:20:00', 'ENTREGADO', 54000.00, 5, 5),
('2026-03-06 14:10:00', 'INGRESADO', 0.00, 6, 6),
('2026-03-07 15:05:00', 'EN_DIAGNOSTICO', 0.00, 7, 7),
('2026-03-08 16:40:00', 'EN_REPARACION', 145000.00, 8, 8),
('2026-03-09 08:55:00', 'ESPERANDO_APROBACION', 99000.00, 9, 9),
('2026-03-10 09:25:00', 'LISTO_PARA_ENTREGA', 112000.00, 10, 10);

-- 10 diagnósticos de prueba
INSERT INTO Diagnosticos (id_orden, descripcion, observaciones, presupuesto_estimado) VALUES
(1, 'Cambio de aceite y filtro', 'Se recomienda mantenimiento cada 5000 km', 120000.00),
(2, 'Revisión de pastillas de freno', 'Pastillas delanteras con desgaste alto', 85000.00),
(3, 'Reparación de caja de cambios', 'Presenta ruido en segunda marcha', 230000.00),
(4, 'Ajuste de suspensión delantera', 'Amortiguador izquierdo con fuga leve', 76000.00),
(5, 'Cambio de batería', 'Batería no retiene carga correctamente', 54000.00),
(6, 'Inspección general preventiva', 'Vehículo pendiente de aprobación del cliente', 65000.00),
(7, 'Diagnóstico de sistema eléctrico', 'Falla intermitente en luces principales', 40000.00),
(8, 'Cambio de kit de clutch', 'Deslizamiento en pendientes pronunciadas', 145000.00),
(9, 'Limpieza de inyectores', 'Consumo de combustible elevado', 99000.00),
(10, 'Alineación y balanceo', 'Vibración en carretera a alta velocidad', 112000.00);

-- 10 administradores de prueba
INSERT INTO Administradores (cedula, nombre, email) VALUES
("118220851", "Johan Davila", "johan.davila@email.com"),
('101-1234-5678', 'Andrea Montero', 'andrea.montero@taller.com'),
('102-1234-5678', 'Luis Brenes', 'luis.brenes@taller.com'),
('103-1234-5678', 'Patricia Solano', 'patricia.solano@taller.com'),
('104-1234-5678', 'Mario Vega', 'mario.vega@taller.com'),
('105-1234-5678', 'Gloria Hidalgo', 'gloria.hidalgo@taller.com'),
('106-1234-5678', 'Felipe Castro', 'felipe.castro@taller.com'),
('107-1234-5678', 'Rebeca Rivas', 'rebeca.rivas@taller.com'),
('108-1234-5678', 'Kevin Aguilar', 'kevin.aguilar@taller.com'),
('109-1234-5678', 'Tatiana Fonseca', 'tatiana.fonseca@taller.com'),
('110-1234-5678', 'Roberto Cerdas', 'roberto.cerdas@taller.com');

-- Recepcionistas de prueba (la tabla Oficinistas no tenía datos)
INSERT INTO Oficinistas (cedula, nombre, email) VALUES
('301-1234-5678', 'Sara Jiménez', 'sara.jimenez@taller.com'),
('302-1234-5678', 'Marco Ureña', 'marco.urena@taller.com');

-- Usuarios de prueba para autenticación (contraseña = bcrypt de la clave indicada en el comentario)
-- Las cédulas coinciden con un registro real en la tabla del rol correspondiente,
-- de lo contrario Autenticar::autenticar() no encuentra el perfil y el login falla.
INSERT INTO Usuarios (cedula, passw, rol) VALUES
('118220851', '$2y$10$VEqP4.Hk.2A/m0ShxXLpYu7b7QIRwddS839siipDa3M6LcagOZSGO', 1),      -- Admin      | cedula: 118220851     | passw: admin123
('301-1234-5678', '$2y$10$C9a1FUzFdb.jB5QCvXvFoutUlcoamR1dPCEa2u4SwYFyRBu7fCbj2', 2), -- Oficinista | cedula: 301-1234-5678 | passw: ofi123
('1-1234-5678', '$2y$10$v/mDI0fF4R4g.hBJSONgqu.ab3Aj/sWj6h7KDecxUTyfBqdrcHvBG', 3),   -- Mecanico   | cedula: 1-1234-5678   | passw: mec123
('2-1234-5678', '$2y$10$jGvpsxEiG8MX3KN9ERZB9uCutfQsGiIQwGBfu.nyF0ppWNa5LxOhi', 4);   -- Cliente    | cedula: 2-1234-5678   | passw: cli123