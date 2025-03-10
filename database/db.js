const postgres = require("postgres");
require("dotenv").config();

const sql = postgres({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT || 5432,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = sql;
