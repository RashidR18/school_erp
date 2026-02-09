const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createStudent,
  getStudents,
} = require("../controllers/studentController");

router.post("/", auth(["admin"]), createStudent);
router.get("/", auth(["admin"]), getStudents);

module.exports = router;
