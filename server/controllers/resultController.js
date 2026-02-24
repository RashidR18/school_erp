const Result = require("../models/Result");
const Student = require("../models/Student");
const { getAuthorizedChildForParent } = require("../utils/parentAccess");

const ALLOWED_EXAM_TYPES = ["class test", "internal", "external", "practical"];

function normalizeExamType(value) {
  return String(value || "").trim().toLowerCase();
}

async function getLeaderboardPayload(studentId, examTypeFilter, academicYear) {
  const student = await Student.findById(studentId).select("className division");
  if (!student) return null;

  const classStudents = await Student.find({
    className: student.className,
    division: student.division,
  }).select("_id name rollNo");

  const studentIds = classStudents.map((s) => s._id);
  const query = { studentId: { $in: studentIds } };
  if (examTypeFilter && ALLOWED_EXAM_TYPES.includes(examTypeFilter)) {
    query.examType = examTypeFilter;
  }
  if (Number.isInteger(academicYear)) {
    query.academicYear = academicYear;
  }

  const results = await Result.find(query).select(
    "studentId marks totalMarks examType subject academicYear",
  );

  const byStudent = new Map();
  classStudents.forEach((s) => {
    byStudent.set(String(s._id), {
      studentId: s._id,
      name: s.name,
      rollNo: s.rollNo,
      obtained: 0,
      total: 0,
    });
  });

  results.forEach((r) => {
    const id = String(r.studentId);
    const row = byStudent.get(id);
    if (!row) return;
    row.obtained += Number(r.marks || 0);
    row.total += Number(r.totalMarks || 0);
  });

  const ranked = Array.from(byStudent.values())
    .map((r) => ({
      ...r,
      percentage: r.total > 0 ? Number(((r.obtained / r.total) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage || b.obtained - a.obtained);

  ranked.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  const top3 = ranked.slice(0, 3);
  const myRow = ranked.find((r) => String(r.studentId) === String(studentId)) || null;

  return {
    className: student.className || "",
    division: student.division || "",
    examType: examTypeFilter || "all",
    academicYear: Number.isInteger(academicYear) ? academicYear : "all",
    top3,
    myRank: myRow,
    leaderboard: ranked,
  };
}

// ADMIN / TEACHER: add/update result
exports.addResult = async (req, res) => {
  const studentId = req.body.studentId;
  const subject = String(req.body.subject || "").trim();
  const marks = Number(req.body.marks || 0);
  const totalMarks = Number(req.body.totalMarks || 0);
  const academicYear = Number(req.body.academicYear || new Date().getFullYear());
  const examType = normalizeExamType(req.body.examType);

  if (!studentId || !subject) {
    return res.status(400).json({ message: "studentId and subject are required" });
  }
  if (!ALLOWED_EXAM_TYPES.includes(examType)) {
    return res.status(400).json({
      message: "Invalid exam type. Use class test, internal, external, or practical.",
    });
  }
  if (totalMarks <= 0) {
    return res.status(400).json({ message: "Total marks must be greater than 0" });
  }
  if (marks < 0 || marks > totalMarks) {
    return res.status(400).json({ message: "Marks must be between 0 and total marks" });
  }
  if (!Number.isInteger(academicYear)) {
    return res.status(400).json({ message: "Invalid academic year" });
  }

  const result = await Result.findOneAndUpdate(
    { studentId, subject, examType, academicYear },
    { studentId, subject, marks, totalMarks, examType, academicYear },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.json(result);
};

// ADMIN / TEACHER: view results
exports.getResultsByStudent = async (req, res) => {
  const results = await Result.find({
    studentId: req.params.studentId,
  }).sort({ academicYear: -1, createdAt: -1 });
  res.json(results);
};

// PARENT: view own child results
exports.getMyChildResults = async (req, res) => {
  const student = await getAuthorizedChildForParent(req.user.id, req.params.studentId);
  if (!student) return res.sendStatus(403);

  const results = await Result.find({ studentId: student._id }).sort({
    academicYear: -1,
    createdAt: -1,
  });
  res.json(results);
};

// ADMIN / TEACHER / PARENT: class ranking
exports.getClassLeaderboard = async (req, res) => {
  const studentId = req.params.studentId;
  const examType = normalizeExamType(req.query.examType);
  const academicYear = req.query.academicYear ? Number(req.query.academicYear) : null;
  const filter = examType && examType !== "all" ? examType : "";

  if (req.user.role === "parent") {
    const authorized = await getAuthorizedChildForParent(req.user.id, studentId);
    if (!authorized) return res.sendStatus(403);
  }

  const payload = await getLeaderboardPayload(
    studentId,
    filter,
    Number.isInteger(academicYear) ? academicYear : null,
  );
  if (!payload) return res.sendStatus(404);
  res.json(payload);
};
