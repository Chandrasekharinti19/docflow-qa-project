const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/documentController");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/", getAllDocuments);
router.post("/", upload.single("file"), createDocument);
router.get("/reviewers", getReviewers);
router.get("/:id/audit-logs", getDocumentAuditLogs);
router.get("/:id/download", downloadDocumentFile);
router.get("/:id", getDocumentById);
router.patch("/:id/assign-reviewer", assignReviewer);
router.patch("/:id/approve", approveDocument);
router.patch("/:id/reject", rejectDocument);
router.delete("/:id", deleteDocument);

module.exports = router;