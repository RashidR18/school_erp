const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: { type: String, required: true },
    marks: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 1, default: 100 },
    academicYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 3000,
      default: () => new Date().getFullYear(),
    },
    examType: {
      type: String,
      enum: ["class test", "internal", "external", "practical"],
      required: true,
    },
  },
  { timestamps: true },
);

resultSchema.index({ studentId: 1, subject: 1, examType: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
