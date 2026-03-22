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
} = require("../controllers/documentController");

router.get("/", getAllDocuments);
router.post("/", createDocument);
router.get("/reviewers", getReviewers);
router.get("/:id", getDocumentById);
router.patch("/:id/assign-reviewer", assignReviewer);
router.patch("/:id/approve", approveDocument);
router.patch("/:id/reject", rejectDocument);

module.exports = router;