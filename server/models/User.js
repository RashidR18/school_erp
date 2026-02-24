const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "teacher", "parent"] },
  phone: { type: String, default: "" },
  profilePhoto: { type: String, default: "" },
  linkedStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

module.exports = mongoose.model("User", userSchema);
