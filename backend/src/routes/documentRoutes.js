const express = require("express");
const router = express.Router();
const {
  getAllDocuments,
  createDocument,
  getDocumentById,
  assignReviewer,
  getReviewers,
} = require("../controllers/documentController");

router.get("/", getAllDocuments);
router.post("/", createDocument);
router.get("/reviewers", getReviewers);
router.get("/:id", getDocumentById);
router.patch("/:id/assign-reviewer", assignReviewer);

module.exports = router;