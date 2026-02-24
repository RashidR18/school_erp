const Fee = require("../models/Fee");
const { getAuthorizedChildForParent } = require("../utils/parentAccess");

// ADMIN
exports.setFee = async (req, res) => {
  const { studentId, totalAmount, paidAmount, status } = req.body;
  const fee = await Fee.findOneAndUpdate(
    { studentId },
    { studentId, totalAmount, paidAmount, status },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json(fee);
};

// ADMIN
exports.getFeeByStudent = async (req, res) => {
  const fee = await Fee.findOne({ studentId: req.params.studentId });
  res.json(fee);
};

// PARENT
exports.getMyChildFee = async (req, res) => {
  const student = await getAuthorizedChildForParent(req.user.id, req.params.studentId);

  if (!student) return res.sendStatus(403);

  const fee = await Fee.findOne({ studentId: student._id });
  res.json(fee);
};
