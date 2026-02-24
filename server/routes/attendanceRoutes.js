const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  markAttendance,
  getAttendanceByStudent,
  getMyChildAttendance,
} = require("../controllers/attendanceController");

// Teacher/Admin marks attendance
router.post("/", auth(["teacher", "admin"]), markAttendance);

// Parent views own child
router.get("/parent/:studentId", auth(["parent"]), getMyChildAttendance);

// Admin / Teacher view attendance
router.get("/:studentId", auth(["admin", "teacher"]), getAttendanceByStudent);

module.exports = router;
