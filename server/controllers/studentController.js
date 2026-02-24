const Student = require("../models/Student");
const User = require("../models/User");
const Result = require("../models/Result");

const PASS_PERCENTAGE = 40;

function getNextClassName(className) {
  const num = Number(String(className || "").trim());
  if (!Number.isInteger(num) || num < 1 || num >= 12) return null;
  return String(num + 1);
}

async function getStudentYearlyPerformance(studentId, year) {
  const start = new Date(Date.UTC(Number(year), 0, 1));
  const end = new Date(Date.UTC(Number(year) + 1, 0, 1));
  const results = await Result.find({
    studentId,
    createdAt: { $gte: start, $lt: end },
  }).select("marks totalMarks");

  const obtained = results.reduce((sum, r) => sum + Number(r.marks || 0), 0);
  const total = results.reduce((sum, r) => sum + Number(r.totalMarks || 0), 0);
  const percentage = total > 0 ? (obtained / total) * 100 : 0;

  return {
    hasResults: results.length > 0,
    obtained,
    total,
    percentage: Number(percentage.toFixed(2)),
    passed: results.length > 0 && percentage >= PASS_PERCENTAGE,
  };
}

async function runAutomaticPromotion(year) {
  const targetYear = Number(year);
  if (!Number.isInteger(targetYear)) {
    return {
      year: year,
      promotedCount: 0,
      promoted: [],
      skippedCount: 0,
      skipped: [],
    };
  }

  const students = await Student.find({ lastPromotionYear: { $ne: targetYear } });
  const promoted = [];
  const skipped = [];

  for (const student of students) {
    const nextClass = getNextClassName(student.className);
    if (!nextClass) {
      skipped.push({
        studentId: student._id,
        name: student.name,
        reason: "No next class available",
      });
      continue;
    }

    const performance = await getStudentYearlyPerformance(student._id, targetYear);
    if (!performance.passed) {
      skipped.push({
        studentId: student._id,
        name: student.name,
        reason: performance.hasResults
          ? `Not passed (${performance.percentage}%)`
          : "No result records for year",
      });
      continue;
    }

    const fromClass = student.className;
    student.className = nextClass;
    student.lastPromotionYear = targetYear;
    await student.save();

    promoted.push({
      studentId: student._id,
      name: student.name,
      fromClass,
      toClass: nextClass,
      percentage: performance.percentage,
    });
  }

  return {
    year: targetYear,
    promotedCount: promoted.length,
    promoted,
    skippedCount: skipped.length,
    skipped,
  };
}

// CREATE student (Admin/Teacher)
exports.createStudent = async (req, res) => {
  const rollNo = String(req.body.rollNo || "").trim();
  const className = String(req.body.className || "").trim();
  const division = String(req.body.division || "").trim();

  const existing = await Student.findOne({ rollNo, className, division });
  if (existing) {
    return res.json({
      ...existing.toObject(),
      skipped: true,
      message: "Student already exists. Skipped creating duplicate.",
    });
  }

  const student = await Student.create(req.body);

  if (req.body.parentId) {
    await User.findByIdAndUpdate(req.body.parentId, {
      $addToSet: { linkedStudentIds: student._id },
    });
  }

  res.json(student);
};

// GET students
exports.getStudents = async (req, res) => {
  if (req.user.role === "parent") {
    const parent = await User.findById(req.user.id).select("linkedStudentIds");
    const linkedIds = Array.isArray(parent?.linkedStudentIds) ? parent.linkedStudentIds : [];
    const students = await Student.find({
      $or: [{ _id: { $in: linkedIds } }, { parentId: req.user.id }],
    }).populate("parentId", "name email");
    return res.json(students);
  }

  const students = await Student.find().populate("parentId", "name email");
  res.json(students);
};

// ADMIN: manual promotion of selected student
exports.promoteStudentManually = async (req, res) => {
  const studentId = req.body?.studentId || req.body?._id || req.params?.studentId;
  const year = Number(req.body.year || new Date().getFullYear());

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const nextClass = getNextClassName(student.className);
  if (!nextClass) {
    return res.status(400).json({ message: "Student cannot be promoted to next class" });
  }

  const fromClass = student.className;
  student.className = nextClass;
  student.lastPromotionYear = year;
  await student.save();

  res.json({
    message: "Student promoted manually",
    studentId: student._id,
    name: student.name,
    fromClass,
    toClass: nextClass,
    year,
  });
};

// ADMIN: run auto promotion immediately
exports.runAutoPromotion = async (req, res) => {
  const year = Number(req.body?.year || new Date().getFullYear());
  const report = await runAutomaticPromotion(year);
  res.json({
    message: "Auto promotion completed",
    ...report,
  });
};

exports.runAutomaticPromotionJob = runAutomaticPromotion;
