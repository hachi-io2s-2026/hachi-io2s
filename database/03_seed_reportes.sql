-- Datos sintéticos complementarios; ejecutar después de 01 y 02 (MySQL 8+).
-- No modifica tablas ni datos existentes. Etiquetas HACHI-REPORTES-V1 evitan duplicar
-- al repetir el script; las fechas de reservas ya insertadas permanecen intactas.
-- 60 reservas, 12 propietarios, 12 mascotas. No ejecutar concurrentemente.
USE hachi_db;
START TRANSACTION;

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 01', 'Reportes', '5555-1001', 'reportes01@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes01@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 01','Labrador','MACHO',28.5
FROM propietarios p WHERE p.correo='reportes01@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 01');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 02', 'Reportes', '5555-1002', 'reportes02@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes02@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 02','Beagle','HEMBRA',11.2
FROM propietarios p WHERE p.correo='reportes02@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 02');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 03', 'Reportes', '5555-1003', 'reportes03@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes03@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 03','Chihuahua','MACHO',4.5
FROM propietarios p WHERE p.correo='reportes03@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 03');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 04', 'Reportes', '5555-1004', 'reportes04@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes04@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 04','Mestizo','HEMBRA',18
FROM propietarios p WHERE p.correo='reportes04@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 04');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 05', 'Reportes', '5555-1005', 'reportes05@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes05@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 05','Pastor Alemán','MACHO',32
FROM propietarios p WHERE p.correo='reportes05@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 05');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 06', 'Reportes', '5555-1006', 'reportes06@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes06@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 06','Poodle','HEMBRA',7.5
FROM propietarios p WHERE p.correo='reportes06@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 06');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 07', 'Reportes', '5555-1007', 'reportes07@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes07@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 07','Labrador','MACHO',28.5
FROM propietarios p WHERE p.correo='reportes07@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 07');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 08', 'Reportes', '5555-1008', 'reportes08@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes08@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 08','Beagle','HEMBRA',11.2
FROM propietarios p WHERE p.correo='reportes08@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 08');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 09', 'Reportes', '5555-1009', 'reportes09@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes09@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 09','Chihuahua','MACHO',4.5
FROM propietarios p WHERE p.correo='reportes09@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 09');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 10', 'Reportes', '5555-1010', 'reportes10@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes10@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 10','Mestizo','HEMBRA',18
FROM propietarios p WHERE p.correo='reportes10@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 10');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 11', 'Reportes', '5555-1011', 'reportes11@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes11@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 11','Pastor Alemán','MACHO',32
FROM propietarios p WHERE p.correo='reportes11@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 11');

INSERT INTO propietarios(nombre,apellido,telefono,correo,direccion)
SELECT 'Cliente demo 12', 'Reportes', '5555-1012', 'reportes12@hachi.example', 'Guatemala (sintético)'
WHERE NOT EXISTS(SELECT 1 FROM propietarios WHERE correo='reportes12@hachi.example');
INSERT INTO mascotas(id_propietario,nombre,raza,sexo,peso_kg)
SELECT p.id_propietario,'Demo 12','Poodle','HEMBRA',7.5
FROM propietarios p WHERE p.correo='reportes12@hachi.example'
AND NOT EXISTS(SELECT 1 FROM mascotas m WHERE m.id_propietario=p.id_propietario AND m.nombre='Demo 12');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 236 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 236 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-001'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 236 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 236 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-001');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-001'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-001' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-001-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-001' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-001-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 232 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 232 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-002'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 232 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 232 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-002');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-002'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-002' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-002-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-002' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-002-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 228 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 228 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-003'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 228 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 228 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-003');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-003'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-003' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-003-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-003' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-003-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 224 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 224 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-004'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 224 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 224 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-004');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 60 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-004'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-004' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PENDIENTE',NULL,'HACHI-REPORTES-V1-004-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-004' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-004-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 220 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 220 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-005'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 220 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 220 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-005');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-005'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-005' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-005-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-005' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-005-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 216 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 216 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-006'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 216 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 216 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-006');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-006'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-006' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-006-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-006' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-006-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 212 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 212 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-007'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 212 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 212 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-007');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-007'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-007' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.5,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-007-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-007' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-007-PAGO');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.25,'TRANSFERENCIA','PAGADO',DATE_ADD(r.fecha_inicio,INTERVAL 1 HOUR),'HACHI-REPORTES-V1-007-ABONO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-007' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-007-ABONO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 208 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 208 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-008'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 208 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 208 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-008');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-008'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-008' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PENDIENTE',NULL,'HACHI-REPORTES-V1-008-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-008' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-008-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 204 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 204 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-009'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 204 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 204 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-009');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-009'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-009' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-009-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-009' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-009-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 200 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 200 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-010'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 200 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 200 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-010');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),NULL,NULL,'AUSENTE','HACHI-REPORTES-V1-010'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-010' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-010-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-010' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-010-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 196 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 196 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-011'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 196 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 196 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-011');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-011'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-011' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-011-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-011' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-011-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 192 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 192 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-012'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 192 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 192 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-012');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-012'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-012' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PENDIENTE',NULL,'HACHI-REPORTES-V1-012-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-012' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-012-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 188 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 188 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'CANCELADA','HACHI-REPORTES-V1-013'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 188 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 188 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-013');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','ANULADO',NULL,'HACHI-REPORTES-V1-013-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-013' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-013-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 184 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 184 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-014'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 184 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 184 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-014');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 60 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-014'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-014' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.5,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-014-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-014' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-014-PAGO');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.25,'TRANSFERENCIA','PAGADO',DATE_ADD(r.fecha_inicio,INTERVAL 1 HOUR),'HACHI-REPORTES-V1-014-ABONO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-014' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-014-ABONO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-015'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-015');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-015'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-015' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-015-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-015' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-015-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 176 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 176 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-016'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 176 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 176 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-016');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-016'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-016' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PENDIENTE',NULL,'HACHI-REPORTES-V1-016-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-016' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-016-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 172 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 172 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-017'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 172 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 172 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-017');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-017'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-017' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-017-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-017' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-017-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 168 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 168 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-018'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 168 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 168 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-018');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-018'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-018' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-018-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-018' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-018-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 164 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 164 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-019'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 164 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 164 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-019');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-019'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-019' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-019-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-019' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-019-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 160 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 160 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-020'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 160 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 160 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-020');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),NULL,NULL,'AUSENTE','HACHI-REPORTES-V1-020'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-020' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PENDIENTE',NULL,'HACHI-REPORTES-V1-020-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-020' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-020-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 156 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 156 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-021'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 156 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 156 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-021');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-021'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-021' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.5,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-021-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-021' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-021-PAGO');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.25,'TRANSFERENCIA','PAGADO',DATE_ADD(r.fecha_inicio,INTERVAL 1 HOUR),'HACHI-REPORTES-V1-021-ABONO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-021' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-021-ABONO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 152 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 152 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-022'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 152 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 152 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-022');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-022'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-022' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-022-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-022' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-022-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 148 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 148 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-023'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 148 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 148 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-023');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-023'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-023' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-023-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-023' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-023-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 144 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 144 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-024'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 144 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 144 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-024');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 60 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-024'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-024' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PENDIENTE',NULL,'HACHI-REPORTES-V1-024-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-024' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-024-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 140 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 140 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-025'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 140 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 140 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-025');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-025'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-025' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-025-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-025' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-025-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 136 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 136 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'CANCELADA','HACHI-REPORTES-V1-026'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 136 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 136 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-026');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','ANULADO',NULL,'HACHI-REPORTES-V1-026-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-026' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-026-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 132 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 132 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-027'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 132 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 132 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-027');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-027'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-027' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-027-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-027' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-027-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 128 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 128 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-028'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 128 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 128 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-028');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-028'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-028' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PENDIENTE',NULL,'HACHI-REPORTES-V1-028-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-028' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-028-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 124 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 124 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-029'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 124 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 124 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-029');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-029'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-029' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-029-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-029' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-029-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 120 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 120 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-030'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 120 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 120 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-030');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),NULL,NULL,'AUSENTE','HACHI-REPORTES-V1-030'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-030' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-030-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-030' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-030-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 116 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 116 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-031'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 116 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 116 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-031');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-031'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-031' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-031-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-031' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-031-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 112 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 112 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-032'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 112 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 112 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes01@hachi.example' AND m.nombre='Demo 01' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-032');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-032'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-032' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PENDIENTE',NULL,'HACHI-REPORTES-V1-032-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-032' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-032-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 108 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 108 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-033'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 108 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 108 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-033');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-033'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-033' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-033-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-033' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-033-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 104 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 104 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-034'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 104 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 104 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-034');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 60 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-034'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-034' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-034-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-034' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-034-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 100 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 100 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-035'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 100 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 100 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-035');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-035'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-035' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.5,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-035-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-035' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-035-PAGO');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.25,'TRANSFERENCIA','PAGADO',DATE_ADD(r.fecha_inicio,INTERVAL 1 HOUR),'HACHI-REPORTES-V1-035-ABONO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-035' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-035-ABONO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 96 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 96 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-036'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 96 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 96 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-036');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-036'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-036' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PENDIENTE',NULL,'HACHI-REPORTES-V1-036-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-036' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-036-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 92 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 92 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-037'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 92 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 92 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-037');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-037'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-037' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-037-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-037' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-037-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 88 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 88 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-038'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 88 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 88 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-038');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-038'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-038' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-038-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-038' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-038-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 84 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 84 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'CANCELADA','HACHI-REPORTES-V1-039'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 84 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 84 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-039');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','ANULADO',NULL,'HACHI-REPORTES-V1-039-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-039' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-039-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 80 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 80 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-040'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 80 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 80 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-040');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),NULL,NULL,'AUSENTE','HACHI-REPORTES-V1-040'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-040' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PENDIENTE',NULL,'HACHI-REPORTES-V1-040-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-040' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-040-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 76 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 76 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-041'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 76 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 76 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-041');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-041'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-041' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-041-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-041' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-041-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 72 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 72 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-042'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 72 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 72 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes02@hachi.example' AND m.nombre='Demo 02' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-042');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-042'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-042' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.5,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-042-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-042' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-042-PAGO');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.25,'TRANSFERENCIA','PAGADO',DATE_ADD(r.fecha_inicio,INTERVAL 1 HOUR),'HACHI-REPORTES-V1-042-ABONO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-042' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-042-ABONO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 68 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 68 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-043'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 68 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 68 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes03@hachi.example' AND m.nombre='Demo 03' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-043');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-043'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-043' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-043-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-043' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-043-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 64 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 64 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-044'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 64 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 64 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes03@hachi.example' AND m.nombre='Demo 03' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-044');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 60 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-044'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-044' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PENDIENTE',NULL,'HACHI-REPORTES-V1-044-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-044' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-044-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-045'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes04@hachi.example' AND m.nombre='Demo 04' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-045');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-045'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-045' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-045-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-045' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-045-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-046'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 56 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes04@hachi.example' AND m.nombre='Demo 04' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-046');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-046'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-046' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-046-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-046' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-046-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-047'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 52 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes05@hachi.example' AND m.nombre='Demo 05' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-047');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-047'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-047' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-047-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-047' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-047-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 48 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 48 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-048'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 48 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 48 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes05@hachi.example' AND m.nombre='Demo 05' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-048');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-048'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-048' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PENDIENTE',NULL,'HACHI-REPORTES-V1-048-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-048' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-048-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 44 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 44 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-049'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 44 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 44 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes06@hachi.example' AND m.nombre='Demo 06' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-049');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-049'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-049' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.5,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-049-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-049' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-049-PAGO');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*0.25,'TRANSFERENCIA','PAGADO',DATE_ADD(r.fecha_inicio,INTERVAL 1 HOUR),'HACHI-REPORTES-V1-049-ABONO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-049' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-049-ABONO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 40 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 40 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-050'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 40 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 40 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes06@hachi.example' AND m.nombre='Demo 06' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-050');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),NULL,NULL,'AUSENTE','HACHI-REPORTES-V1-050'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-050' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-050-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-050' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-050-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 36 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 36 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-051'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 36 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 36 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes07@hachi.example' AND m.nombre='Demo 07' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-051');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-051'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-051' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-051-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-051' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-051-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 32 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 32 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'CANCELADA','HACHI-REPORTES-V1-052'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 32 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 32 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes07@hachi.example' AND m.nombre='Demo 07' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-052');

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','ANULADO',NULL,'HACHI-REPORTES-V1-052-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-052' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-052-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'FINALIZADA','HACHI-REPORTES-V1-053'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 28 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes08@hachi.example' AND m.nombre='Demo 08' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-053');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 10 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 20 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-053'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-053' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-053-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-053' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-053-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 24 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 24 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-054'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 24 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 24 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes08@hachi.example' AND m.nombre='Demo 08' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-054');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 60 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-054'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-054' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-054-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-054' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-054-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '14:00:00'),INTERVAL 2 DAY),t.precio*2,'FINALIZADA','HACHI-REPORTES-V1-055'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes09@hachi.example' AND m.nombre='Demo 09' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-055');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL -20 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -40 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-055'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-055' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-055-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-055' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-055-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-056'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes09@hachi.example' AND m.nombre='Demo 09' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-056');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 30 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL -30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-056'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-056' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PENDIENTE',NULL,'HACHI-REPORTES-V1-056-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-056' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-056-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '14:00:00'),INTERVAL 1 DAY),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-057'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes10@hachi.example' AND m.nombre='Demo 10' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-057');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 0 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-057'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-057' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-057-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-057' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-057-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'FINALIZADA','HACHI-REPORTES-V1-058'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes10@hachi.example' AND m.nombre='Demo 10' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-058');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 15 MINUTE),DATE_ADD(r.fecha_fin,INTERVAL 30 MINUTE),'FINALIZADO','HACHI-REPORTES-V1-058'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-058' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TARJETA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-058-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-058' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-058-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '14:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '14:00:00'),INTERVAL 3 DAY),t.precio*3,'EN_CURSO','HACHI-REPORTES-V1-059'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '14:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '14:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes11@hachi.example' AND m.nombre='Demo 11' AND s.tipo='HOSPEDAJE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-059');

INSERT INTO hospedajes(id_reservacion,fecha_entrada,fecha_salida,estado,observaciones)
SELECT r.id_reservacion,DATE_ADD(r.fecha_inicio,INTERVAL 20 MINUTE),NULL,'HOSPEDADO','HACHI-REPORTES-V1-059'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-059' AND NOT EXISTS(SELECT 1 FROM hospedajes h WHERE h.id_reservacion=r.id_reservacion);

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'TRANSFERENCIA','PAGADO',r.fecha_inicio,'HACHI-REPORTES-V1-059-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-059' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-059-PAGO');

INSERT INTO reservaciones(id_mascota,id_servicio,id_tarifa,fecha_inicio,fecha_fin,monto_total,estado,observaciones)
SELECT m.id_mascota,s.id_servicio,t.id_tarifa,TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '08:00:00'),DATE_ADD(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '08:00:00'),INTERVAL 9 HOUR),t.precio*1,'EN_CURSO','HACHI-REPORTES-V1-060'
FROM mascotas m JOIN propietarios p USING(id_propietario) CROSS JOIN servicios s
JOIN tarifas t ON t.id_tarifa=(SELECT t2.id_tarifa FROM tarifas t2 WHERE t2.id_servicio=s.id_servicio AND t2.activo=1
AND t2.fecha_inicio_vigencia<=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '08:00:00')) AND (t2.fecha_fin_vigencia IS NULL OR t2.fecha_fin_vigencia>=DATE(TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 0 DAY), '08:00:00')))
ORDER BY t2.fecha_inicio_vigencia DESC,t2.id_tarifa DESC LIMIT 1)
WHERE p.correo='reportes11@hachi.example' AND m.nombre='Demo 11' AND s.tipo='DAYCARE'
AND NOT EXISTS(SELECT 1 FROM reservaciones WHERE observaciones='HACHI-REPORTES-V1-060');

INSERT INTO asistencias_daycare(id_reservacion,fecha,hora_entrada,hora_salida,estado,observaciones)
SELECT r.id_reservacion,DATE(r.fecha_inicio),DATE_ADD(r.fecha_inicio,INTERVAL 0 MINUTE),NULL,'PRESENTE','HACHI-REPORTES-V1-060'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-060' AND NOT EXISTS(SELECT 1 FROM asistencias_daycare a WHERE a.id_reservacion=r.id_reservacion AND a.fecha=DATE(r.fecha_inicio));

INSERT INTO pagos(id_reservacion,monto,metodo_pago,estado,fecha_pago,observaciones)
SELECT r.id_reservacion,r.monto_total*1,'EFECTIVO','PENDIENTE',NULL,'HACHI-REPORTES-V1-060-PAGO'
FROM reservaciones r WHERE r.observaciones='HACHI-REPORTES-V1-060' AND NOT EXISTS(SELECT 1 FROM pagos p WHERE p.observaciones='HACHI-REPORTES-V1-060-PAGO');

COMMIT;
-- Verificación esperada: 60 reservas sintéticas. Si hay menos, revise vigencias de tarifas.
SELECT estado,COUNT(*) cantidad,SUM(monto_total) facturacion FROM reservaciones WHERE observaciones LIKE 'HACHI-REPORTES-V1-%' GROUP BY estado;
