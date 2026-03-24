const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/health", async (req, res) => {
  try {
    const dbResult = await pool.query("SELECT NOW()");
    res.status(200).json({
      message: "Backend is running",
      database: "Connected",
      time: dbResult.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Backend is running, but database connection failed",
      error: error.message,
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File is too large. Maximum allowed size is 10 MB",
    });
  }

  if (err.message && err.message.includes("Unsupported file type")) {
    return res.status(400).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: "Unexpected server error",
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});