const Fee = require("../models/Fee");
const Student = require("../models/Student");

// ADMIN
exports.setFee = async (req, res) => {
  const fee = await Fee.create(req.body);
  res.json(fee);
};

// ADMIN
exports.getFeeByStudent = async (req, res) => {
  const fee = await Fee.findOne({ studentId: req.params.studentId });
  res.json(fee);
};

// PARENT
exports.getMyChildFee = async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.studentId,
    parentId: req.user.id,
  });

  if (!student) return res.sendStatus(403);

  const fee = await Fee.findOne({ studentId: student._id });
  res.json(fee);
};
