const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  markAttendance,
  getAttendanceByStudent,
  getMyChildAttendance,
} = require("../controllers/attendanceController");

// Teacher marks attendance
router.post("/", auth(["teacher"]), markAttendance);

// Admin / Teacher view attendance
router.get("/:studentId", auth(["admin", "teacher"]), getAttendanceByStudent);

// Parent views own child
router.get("/parent/:studentId", auth(["parent"]), getMyChildAttendance);

module.exports = router;
