const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  setFee,
  getFeeByStudent,
  getMyChildFee,
} = require("../controllers/feeController");

router.post("/", auth(["admin"]), setFee);
router.get("/parent/:studentId", auth(["parent"]), getMyChildFee);
router.get("/:studentId", auth(["admin", "teacher"]), getFeeByStudent);

module.exports = router;
