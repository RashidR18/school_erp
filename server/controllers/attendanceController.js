const Attendance = require("../models/Attendance");
const { getAuthorizedChildForParent } = require("../utils/parentAccess");

// TEACHER: mark attendance
exports.markAttendance = async (req, res) => {
  const { studentId, date, status } = req.body;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }
  parsedDate.setHours(0, 0, 0, 0);

  const record = await Attendance.findOneAndUpdate(
    { studentId, date: parsedDate },
    { $set: { status }, $setOnInsert: { studentId, date: parsedDate } },
    { upsert: true, new: true },
  );

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
  const student = await getAuthorizedChildForParent(req.user.id, req.params.studentId);

  if (!student) return res.sendStatus(403);

  const records = await Attendance.find({
    studentId: student._id,
  });

  res.json(records);
};
