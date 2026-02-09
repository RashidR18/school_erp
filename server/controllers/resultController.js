const Result = require("../models/Result");
const Student = require("../models/Student");

// TEACHER: add result
exports.addResult = async (req, res) => {
  const result = await Result.create(req.body);
  res.json(result);
};

// ADMIN / TEACHER: view results
exports.getResultsByStudent = async (req, res) => {
  const results = await Result.find({
    studentId: req.params.studentId,
  });
  res.json(results);
};

// PARENT: view own child results
exports.getMyChildResults = async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.studentId,
    parentId: req.user.id,
  });

  if (!student) return res.sendStatus(403);

  const results = await Result.find({ studentId: student._id });
  res.json(results);
};
