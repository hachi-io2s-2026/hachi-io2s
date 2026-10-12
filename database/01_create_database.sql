
CREATE DATABASE IF NOT EXISTS hachi_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hachi_db;

--  USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'EMPLEADO') NOT NULL DEFAULT 'EMPLEADO',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROPIETARIOS
CREATE TABLE IF NOT EXISTS propietarios (
    id_propietario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(150),
    direccion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MASCOTAS
CREATE TABLE IF NOT EXISTS mascotas (
    id_mascota INT AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    raza VARCHAR(100),
    sexo ENUM('MACHO', 'HEMBRA'),
    fecha_nacimiento DATE,
    peso_kg DECIMAL(6,2),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mascota_propietario
        FOREIGN KEY (id_propietario)
        REFERENCES propietarios(id_propietario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

--  SERVICIOS
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    tipo ENUM('HOSPEDAJE', 'DAYCARE') NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--  RESERVACIONES
CREATE TABLE IF NOT EXISTS reservaciones (
    id_reservacion INT AUTO_INCREMENT PRIMARY KEY,
    id_mascota INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA')
        NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reserva_mascota
        FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_reserva_servicio
        FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_fechas_reserva CHECK (fecha_fin > fecha_inicio),
    INDEX idx_reserva_fechas (fecha_inicio, fecha_fin),
    INDEX idx_reserva_estado (estado)
);

--  HOSPEDAJES
CREATE TABLE IF NOT EXISTS hospedajes (
    id_hospedaje INT AUTO_INCREMENT PRIMARY KEY,
    id_reservacion INT NOT NULL UNIQUE,
    fecha_entrada DATETIME NULL,
    fecha_salida DATETIME NULL,
    estado ENUM('PENDIENTE', 'HOSPEDADO', 'FINALIZADO')
        NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    CONSTRAINT fk_hospedaje_reserva
        FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_fechas_hospedaje CHECK (
        fecha_entrada IS NULL OR fecha_salida IS NULL
        OR fecha_salida >= fecha_entrada
    )
);

--  ASISTENCIAS DAYCARE
CREATE TABLE IF NOT EXISTS asistencias_daycare (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_reservacion INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada DATETIME NULL,
    hora_salida DATETIME NULL,
    estado ENUM('PROGRAMADO', 'PRESENTE', 'FINALIZADO', 'AUSENTE')
        NOT NULL DEFAULT 'PROGRAMADO',
    observaciones TEXT,
    CONSTRAINT fk_daycare_reserva
        FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_asistencia_reserva_fecha UNIQUE (id_reservacion, fecha),
    CONSTRAINT chk_horas_daycare CHECK (
        hora_entrada IS NULL OR hora_salida IS NULL
        OR hora_salida >= hora_entrada
    )
);

-- TARIFAS
CREATE TABLE IF NOT EXISTS tarifas (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    unidad ENUM('NOCHE', 'DIA') NOT NULL,
    fecha_inicio_vigencia DATE NOT NULL,
    fecha_fin_vigencia DATE NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_tarifa_servicio
        FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_precio_tarifa CHECK (precio >= 0),
    CONSTRAINT chk_vigencia_tarifa CHECK (
        fecha_fin_vigencia IS NULL
        OR fecha_fin_vigencia >= fecha_inicio_vigencia
    ),
    INDEX idx_tarifa_servicio_vigencia (id_servicio, fecha_inicio_vigencia)
);

-- PAGOS
CREATE TABLE IF NOT EXISTS pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_reservacion INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NULL,
    estado ENUM('PENDIENTE', 'PAGADO', 'ANULADO') NOT NULL DEFAULT 'PENDIENTE',
    fecha_pago DATETIME NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_reserva
        FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_monto_pago CHECK (monto >= 0),
    INDEX idx_pago_reservacion (id_reservacion),
    INDEX idx_pago_estado (estado)
);

CREATE TABLE capacidades (
    id_capacidad INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    capacidad_maxima INT NOT NULL,
    fecha_inicio_vigencia DATE NOT NULL,
    fecha_fin_vigencia DATE NULL,

    CONSTRAINT fk_capacidad_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES servicios(id_servicio),

    CONSTRAINT chk_capacidad_positiva
        CHECK (capacidad_maxima > 0),

    CONSTRAINT chk_vigencia_capacidad
        CHECK (
            fecha_fin_vigencia IS NULL
            OR fecha_fin_vigencia >= fecha_inicio_vigencia
        )
);