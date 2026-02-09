const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    totalAmount: Number,
    paidAmount: Number,
    status: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Fee", feeSchema);
