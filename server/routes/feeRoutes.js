const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  setFee,
  getFeeByStudent,
  getMyChildFee,
} = require("../controllers/feeController");

router.post("/", auth(["admin"]), setFee);
router.get("/:studentId", auth(["admin"]), getFeeByStudent);
router.get("/parent/:studentId", auth(["parent"]), getMyChildFee);

module.exports = router;
