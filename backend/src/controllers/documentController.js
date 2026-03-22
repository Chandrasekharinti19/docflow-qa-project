const pool = require("../config/db");

const getAllDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, file_name, status, owner_email, reviewer_email, version, created_at, updated_at
       FROM documents
       ORDER BY id DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

const createDocument = async (req, res) => {
  try {
    const { title, fileName, ownerEmail } = req.body;

    if (!title || !fileName || !ownerEmail) {
      return res.status(400).json({
        message: "Title, fileName, and ownerEmail are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO documents (title, file_name, owner_email)
       VALUES ($1, $2, $3)
       RETURNING id, title, file_name, status, owner_email, reviewer_email, version, created_at, updated_at`,
      [title, fileName, ownerEmail]
    );

    return res.status(201).json({
      message: "Document created successfully",
      document: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create document",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDocuments,
  createDocument,
};