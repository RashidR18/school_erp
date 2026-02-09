const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addResult,
  getResultsByStudent,
  getMyChildResults,
} = require("../controllers/resultController");

router.post("/", auth(["teacher"]), addResult);
router.get("/:studentId", auth(["admin", "teacher"]), getResultsByStudent);
router.get("/parent/:studentId", auth(["parent"]), getMyChildResults);

module.exports = router;
