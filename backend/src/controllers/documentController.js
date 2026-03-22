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

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, title, file_name, status, owner_email, reviewer_email, version, created_at, updated_at
       FROM documents
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch document",
      error: error.message,
    });
  }
};

const getReviewers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role
       FROM users
       WHERE role = 'Reviewer'
       ORDER BY id`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch reviewers",
      error: error.message,
    });
  }
};

const assignReviewer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerEmail, actorEmail } = req.body;

    if (!reviewerEmail || !actorEmail) {
      return res.status(400).json({
        message: "reviewerEmail and actorEmail are required",
      });
    }

    const reviewerResult = await pool.query(
      `SELECT id, email, role FROM users WHERE email = $1`,
      [reviewerEmail]
    );

    if (reviewerResult.rows.length === 0) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    if (reviewerResult.rows[0].role !== "Reviewer") {
      return res.status(400).json({ message: "Selected user is not a Reviewer" });
    }

    const documentResult = await pool.query(
      `UPDATE documents
       SET reviewer_email = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, file_name, status, owner_email, reviewer_email, version, created_at, updated_at`,
      [reviewerEmail, id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    await pool.query(
      `INSERT INTO audit_logs (document_id, action, actor_email, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, "REVIEWER_ASSIGNED", actorEmail, `Assigned reviewer: ${reviewerEmail}`]
    );

    return res.status(200).json({
      message: "Reviewer assigned successfully",
      document: documentResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to assign reviewer",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDocuments,
  createDocument,
  getDocumentById,
  assignReviewer,
  getReviewers,
};