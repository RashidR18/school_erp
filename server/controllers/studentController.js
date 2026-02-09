const Student = require("../models/Student");
const User = require("../models/User");

// CREATE student (Admin)
exports.createStudent = async (req, res) => {
  const student = await Student.create(req.body);

  // link student to parent
  if (req.body.parentId) {
    await User.findByIdAndUpdate(req.body.parentId, {
      $push: { linkedStudentIds: student._id },
    });
  }

  res.json(student);
};

// GET all students (Admin)
exports.getStudents = async (req, res) => {
  const students = await Student.find().populate("parentId", "name email");
  res.json(students);
};
