// src/db/index.js
const { Pool } = require('pg');
require('dotenv').config(); // lee el .env

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Función helper para hacer consultas
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('DB query:', { text, duration: duration + 'ms', rows: res.rowCount });
  return res;
}

module.exports = {
  query,
  pool,
};
