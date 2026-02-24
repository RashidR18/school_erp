const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  me,
  getUsers,
  updateMe,
  deleteMe,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth(["admin", "teacher", "parent"]), me);
router.put("/me", auth(["admin", "teacher", "parent"]), updateMe);
router.delete("/me", auth(["admin", "teacher", "parent"]), deleteMe);
router.get("/users", auth(["admin", "teacher", "parent"]), getUsers);

module.exports = router;
