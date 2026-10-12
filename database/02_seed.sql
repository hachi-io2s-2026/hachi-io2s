
USE hachi_db;

-- SERVICIOS
INSERT IGNORE INTO servicios (nombre, descripcion, tipo) VALUES
    ('Hospedaje nocturno', 'Estadia de una o varias noches', 'HOSPEDAJE'),
    ('Daycare', 'Cuidado en horario diurno', 'DAYCARE');

-- TARIFAS
INSERT INTO tarifas (id_servicio, nombre, precio, unidad, fecha_inicio_vigencia)
SELECT s.id_servicio, 'Tarifa base por noche', 150.00, 'NOCHE', '2026-01-01'
FROM servicios s
WHERE s.tipo = 'HOSPEDAJE'
  AND NOT EXISTS (SELECT 1 FROM tarifas t WHERE t.id_servicio = s.id_servicio);

INSERT INTO tarifas (id_servicio, nombre, precio, unidad, fecha_inicio_vigencia)
SELECT s.id_servicio, 'Tarifa base por dia', 90.00, 'DIA', '2026-01-01'
FROM servicios s
WHERE s.tipo = 'DAYCARE'
  AND NOT EXISTS (SELECT 1 FROM tarifas t WHERE t.id_servicio = s.id_servicio);

-- CAPACIDADES
INSERT INTO capacidades (id_servicio, capacidad_maxima, fecha_inicio_vigencia)
SELECT s.id_servicio, 10, '2026-01-01'
FROM servicios s
WHERE s.tipo = 'HOSPEDAJE'
  AND NOT EXISTS (SELECT 1 FROM capacidades c WHERE c.id_servicio = s.id_servicio);

INSERT INTO capacidades (id_servicio, capacidad_maxima, fecha_inicio_vigencia)
SELECT s.id_servicio, 15, '2026-01-01'
FROM servicios s
WHERE s.tipo = 'DAYCARE'
  AND NOT EXISTS (SELECT 1 FROM capacidades c WHERE c.id_servicio = s.id_servicio);

-- PROPIETARIOS 
INSERT INTO propietarios (nombre, apellido, telefono, correo, direccion)
SELECT 'Ana', 'Lopez', '5555-0001', 'ana.lopez@ejemplo.com', 'Zona 1, Guatemala'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM propietarios WHERE correo = 'ana.lopez@ejemplo.com');

INSERT INTO propietarios (nombre, apellido, telefono, correo, direccion)
SELECT 'Carlos', 'Perez', '5555-0002', 'carlos.perez@ejemplo.com', 'Zona 10, Guatemala'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM propietarios WHERE correo = 'carlos.perez@ejemplo.com');

-- MASCOTAS 
INSERT INTO mascotas (id_propietario, nombre, raza, sexo, fecha_nacimiento, peso_kg)
SELECT p.id_propietario, 'Max', 'Labrador', 'MACHO', '2021-03-15', 28.50
FROM propietarios p
WHERE p.correo = 'ana.lopez@ejemplo.com'
  AND NOT EXISTS (
      SELECT 1 FROM mascotas m
      WHERE m.id_propietario = p.id_propietario AND m.nombre = 'Max');

INSERT INTO mascotas (id_propietario, nombre, raza, sexo, fecha_nacimiento, peso_kg)
SELECT p.id_propietario, 'Luna', 'Beagle', 'HEMBRA', '2022-07-02', 11.20
FROM propietarios p
WHERE p.correo = 'ana.lopez@ejemplo.com'
  AND NOT EXISTS (
      SELECT 1 FROM mascotas m
      WHERE m.id_propietario = p.id_propietario AND m.nombre = 'Luna');

INSERT INTO mascotas (id_propietario, nombre, raza, sexo, fecha_nacimiento, peso_kg)
SELECT p.id_propietario, 'Rocky', 'Pastor Aleman', 'MACHO', '2020-11-20', 32.00
FROM propietarios p
WHERE p.correo = 'carlos.perez@ejemplo.com'
  AND NOT EXISTS (
      SELECT 1 FROM mascotas m
      WHERE m.id_propietario = p.id_propietario AND m.nombre = 'Rocky');
