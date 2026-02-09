const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// TEACHER: mark attendance
exports.markAttendance = async (req, res) => {
  const { studentId, date, status } = req.body;

  const record = await Attendance.create({
    studentId,
    date,
    status,
  });

  res.json(record);
};

// ADMIN / TEACHER: view attendance
exports.getAttendanceByStudent = async (req, res) => {
  const records = await Attendance.find({
    studentId: req.params.studentId,
  });

  res.json(records);
};

// PARENT: view own child attendance
exports.getMyChildAttendance = async (req, res) => {
  const student = await Student.findOne({
    _id: req.params.studentId,
    parentId: req.user.id,
  });

  if (!student) return res.sendStatus(403);

  const records = await Attendance.find({
    studentId: student._id,
  });

  res.json(records);
};
