const express = require("express");
const router = express.Router();
const {
  getAllDocuments,
  createDocument,
} = require("../controllers/documentController");

router.get("/", getAllDocuments);
router.post("/", createDocument);

module.exports = router;