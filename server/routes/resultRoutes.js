const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addResult,
  getResultsByStudent,
  getMyChildResults,
  getClassLeaderboard,
} = require("../controllers/resultController");

router.post("/", auth(["admin", "teacher"]), addResult);
router.get("/leaderboard/:studentId", auth(["admin", "teacher", "parent"]), getClassLeaderboard);
router.get("/parent/:studentId", auth(["parent"]), getMyChildResults);
router.get("/:studentId", auth(["admin", "teacher"]), getResultsByStudent);

module.exports = router;
