const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

const getAllDocuments = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT id, title, file_name, file_type, file_size_bytes, status, owner_email, reviewer_email, version, created_at, updated_at,
             original_file_name, stored_file_name, mime_type, storage_path, is_deleted, deleted_at, deleted_by
      FROM documents
      WHERE is_deleted = FALSE
    `;
    const values = [];

    if (search && search.trim() !== "") {
      query += ` AND LOWER(title) LIKE LOWER($1) `;
      values.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY id DESC`;

    const result = await pool.query(query, values);

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
    const { title, ownerEmail } = req.body;
    const file = req.file;

    if (!title || !ownerEmail) {
      return res.status(400).json({
        message: "Title and ownerEmail are required",
      });
    }

    if (!file) {
      return res.status(400).json({
        message: "A file upload is required",
      });
    }

    const trimmedTitle = title.trim();
    const trimmedOwnerEmail = ownerEmail.trim();

    if (!trimmedTitle || !trimmedOwnerEmail) {
      return res.status(400).json({
        message: "Title and ownerEmail are required",
      });
    }

    const fileType = path.extname(file.originalname).replace(".", "").toLowerCase();

    const result = await pool.query(
      `INSERT INTO documents (
        title,
        file_name,
        file_type,
        owner_email,
        original_file_name,
        stored_file_name,
        mime_type,
        file_size_bytes,
        storage_path
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, file_name, file_type, file_size_bytes, status, owner_email, reviewer_email, version, created_at, updated_at,
                original_file_name, stored_file_name, mime_type, storage_path`,
      [
        trimmedTitle,
        file.originalname,
        fileType,
        trimmedOwnerEmail,
        file.originalname,
        file.filename,
        file.mimetype,
        file.size,
        file.path,
      ]
    );

    return res.status(201).json({
      message: "Document uploaded successfully",
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
      `SELECT id, title, file_name, file_type, file_size_bytes, status, owner_email, reviewer_email, version, created_at, updated_at,
              original_file_name, stored_file_name, mime_type, storage_path, is_deleted, deleted_at, deleted_by
       FROM documents
       WHERE id = $1 AND is_deleted = FALSE`,
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
      return res.status(400).json({
        message: "Selected user is not a Reviewer",
      });
    }

    const existingDocument = await pool.query(
      `SELECT id, status, is_deleted FROM documents WHERE id = $1`,
      [id]
    );

    if (existingDocument.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (existingDocument.rows[0].status !== "Pending") {
      return res.status(400).json({
        message: `Reviewer can only be assigned to pending documents. Current status: ${existingDocument.rows[0].status}`,
      });
    }
    if (document.is_deleted) {
	  return res.status(400).json({ message: "Deleted documents cannot be approved" });
	}

    const documentResult = await pool.query(
      `UPDATE documents
       SET reviewer_email = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, file_name, file_type, file_size_bytes, status, owner_email, reviewer_email, version, created_at, updated_at,
                 original_file_name, stored_file_name, mime_type, storage_path`,
      [reviewerEmail, id]
    );

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

const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorEmail } = req.body;

    if (!actorEmail) {
      return res.status(400).json({ message: "actorEmail is required" });
    }

    const documentCheck = await pool.query(
      `SELECT id, status, reviewer_email
       FROM documents
       WHERE id = $1`,
      [id]
    );

    if (documentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = documentCheck.rows[0];

    if (!document.reviewer_email) {
      return res.status(400).json({
        message: "Reviewer must be assigned before approval",
      });
    }

    if (document.reviewer_email !== actorEmail) {
      return res.status(403).json({
        message: "Only the assigned reviewer can approve this document",
      });
    }

    if (document.status !== "Pending") {
      return res.status(400).json({
        message: `Only pending documents can be approved. Current status: ${document.status}`,
      });
    }

    const result = await pool.query(
      `UPDATE documents
       SET status = 'Approved', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, file_name, file_type, file_size_bytes, status, owner_email, reviewer_email, version, created_at, updated_at,
                 original_file_name, stored_file_name, mime_type, storage_path`,
      [id]
    );

    await pool.query(
      `INSERT INTO audit_logs (document_id, action, actor_email, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, "APPROVED", actorEmail, "Document approved"]
    );

    return res.status(200).json({
      message: "Document approved successfully",
      document: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to approve document",
      error: error.message,
    });
  }
};

const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorEmail, notes } = req.body;

    if (!actorEmail) {
      return res.status(400).json({ message: "actorEmail is required" });
    }

    const documentCheck = await pool.query(
      `SELECT id, status, reviewer_email, is_deleted
       FROM documents
       WHERE id = $1`,
      [id]
    );

    if (documentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = documentCheck.rows[0];

    if (!document.reviewer_email) {
      return res.status(400).json({
        message: "Reviewer must be assigned before rejection",
      });
    }

    if (document.reviewer_email !== actorEmail) {
      return res.status(403).json({
        message: "Only the assigned reviewer can reject this document",
      });
    }

    if (document.status !== "Pending") {
      return res.status(400).json({
        message: `Only pending documents can be rejected. Current status: ${document.status}`,
      });
    }
    
    if (document.is_deleted) {
  	return res.status(400).json({ message: "Deleted documents cannot be rejected" });	
    }

    const result = await pool.query(
      `UPDATE documents
       SET status = 'Rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, file_name, file_type, file_size_bytes, status, owner_email, reviewer_email, version, created_at, updated_at,
                 original_file_name, stored_file_name, mime_type, storage_path`,
      [id]
    );

    await pool.query(
      `INSERT INTO audit_logs (document_id, action, actor_email, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, "REJECTED", actorEmail, notes || "Document rejected"]
    );

    return res.status(200).json({
      message: "Document rejected successfully",
      document: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reject document",
      error: error.message,
    });
  }
};

const getDocumentAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const documentCheck = await pool.query(
      `SELECT id FROM documents WHERE id = $1`,
      [id]
    );

    if (documentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const result = await pool.query(
      `SELECT id, document_id, action, actor_email, notes, created_at
       FROM audit_logs
       WHERE document_id = $1
       ORDER BY created_at DESC, id DESC`,
      [id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

const downloadDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, original_file_name, stored_file_name, storage_path, is_deleted
   FROM documents
   WHERE id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = result.rows[0];

    if (!document.storage_path || !fs.existsSync(document.storage_path)) {
      return res.status(404).json({ message: "Uploaded file not found on server" });
    }

    return res.download(document.storage_path, document.original_file_name);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download document",
      error: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorEmail } = req.body;

    if (!actorEmail) {
      return res.status(400).json({ message: "actorEmail is required" });
    }

    const result = await pool.query(
      `SELECT id, title, status, owner_email, is_deleted
       FROM documents
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = result.rows[0];

    if (document.is_deleted) {
      return res.status(400).json({ message: "Document is already deleted" });
    }

    if (document.status !== "Pending") {
      return res.status(400).json({
        message: `Only pending documents can be deleted. Current status: ${document.status}`,
      });
    }

    await pool.query(
      `UPDATE documents
       SET is_deleted = TRUE,
           deleted_at = CURRENT_TIMESTAMP,
           deleted_by = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [actorEmail, id]
    );

    await pool.query(
      `INSERT INTO audit_logs (document_id, action, actor_email, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, "DOCUMENT_SOFT_DELETED", actorEmail, `Soft deleted document: ${document.title}`]
    );

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete document",
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
  approveDocument,
  rejectDocument,
  getDocumentAuditLogs,
  downloadDocumentFile,
  deleteDocument,
};