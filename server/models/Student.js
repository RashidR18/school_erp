const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: String,
    rollNo: String,
    className: String,
    division: String,
    dob: Date,
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastPromotionYear: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
