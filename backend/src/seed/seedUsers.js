const pool = require("../config/db");

async function seedUsers() {
  try {
    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@test.com', 'Password123', 'Admin'),
      ('Editor User', 'editor@test.com', 'Password123', 'Editor'),
      ('Reviewer User', 'reviewer@test.com', 'Password123', 'Reviewer'),
      ('Viewer User', 'viewer@test.com', 'Password123', 'Viewer')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log("Users seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedUsers();