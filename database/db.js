const postgres = require("postgres");
require("dotenv").config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const result = await sql`SELECT NOW();`;
    console.log("Database connected:", result);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();

module.exports = sql;
