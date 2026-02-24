const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createStudent,
  getStudents,
  promoteStudentManually,
  runAutoPromotion,
} = require("../controllers/studentController");

router.post("/", auth(["admin", "teacher"]), createStudent);
router.post("/promote/manual", auth(["admin"]), promoteStudentManually);
router.post("/promote/:studentId", auth(["admin"]), promoteStudentManually);
router.post("/promote/auto", auth(["admin"]), runAutoPromotion);
router.get("/", auth(["admin", "teacher", "parent"]), getStudents);

module.exports = router;
