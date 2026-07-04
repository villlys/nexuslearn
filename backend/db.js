// db.js - Conexión a PostgreSQL
// Este archivo crea el puente entre Node.js y tu base de datos NexusLearn

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Prueba de conexión al arrancar el servidor
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✅ Conexión a PostgreSQL exitosa');
    release(); // libera el cliente de prueba, no cierra el pool
  }
});

module.exports = pool;