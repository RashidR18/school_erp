const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/admin", auth(["admin"]), (req, res) => {
  res.json("Admin access granted");
});

module.exports = router;
