const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: String,
    marks: Number,
    examType: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Result", resultSchema);
