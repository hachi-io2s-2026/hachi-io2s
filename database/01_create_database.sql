
-- Base de datos principal de HACHI
CREATE DATABASE IF NOT EXISTS hachi_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usuario local para la aplicación
-- Sustituye la contraseña de ejemplo
CREATE USER IF NOT EXISTS 'hachi_app'@'localhost'
IDENTIFIED BY 'CAMBIAR_POR_PASSWORD_LOCAL';

GRANT ALL PRIVILEGES ON hachi_db.*
TO 'hachi_app'@'localhost';
