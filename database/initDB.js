const sql = require("./db");
const bcrypt = require("bcryptjs");

const initDatabase = async () => {
  try {
    // Create the "users" table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        xp BIGINT NOT NULL DEFAULT 0,
        role TEXT CHECK (role IN ('user','admin')) NOT NULL DEFAULT 'user'
      );
    `;

    // Create the "xp_history" table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS xp_history (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        xp_gained INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Check how many users currently exist
    const existingCount = await sql`
      SELECT COUNT(*) FROM users;
    `;

    const count = parseInt(existingCount[0].count, 10);

    if (count < 2) {
      // Hash passwords for security
      const adminPasswordHash = await bcrypt.hash("adminPassword", 10);
      const userPasswordHash = await bcrypt.hash("userPassword", 10);

      // Insert an admin user and a normal test user
      await sql`
        INSERT INTO users (username, password, role)
        VALUES
          ('admin', ${adminPasswordHash}, 'admin'),
          ('testuser', ${userPasswordHash}, 'user')
      `;

      console.log("Inserted test users into the database.");
    } else {
      console.log("Database already contains test users, skipping creation.");
    }
  } catch (error) {
    console.error("Error initializing the database:", error);
  }
};

module.exports = initDatabase;
