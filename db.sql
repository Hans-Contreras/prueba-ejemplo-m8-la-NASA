-- Creación de Base de Datos
CREATE DATABASE nasa;

-- Creación de Tabla 
CREATE TABLE usuarios (
    id SERIAL,
    email VARCHAR(50),
    nombre VARCHAR(50),
    password VARCHAR(50),
    auth BOOLEAN
);

-- Consulta a tabla de usuarios general
SELECT * FROM usuarios;
