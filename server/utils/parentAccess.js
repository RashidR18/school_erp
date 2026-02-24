const Student = require("../models/Student");
const User = require("../models/User");

async function getAuthorizedChildForParent(parentId, studentId) {
  if (!parentId || !studentId) return null;

  const parent = await User.findById(parentId).select("linkedStudentIds");
  const linkedIds = Array.isArray(parent?.linkedStudentIds)
    ? parent.linkedStudentIds.map((id) => String(id))
    : [];

  const isLinked = linkedIds.includes(String(studentId));
  if (isLinked) {
    return Student.findById(studentId);
  }

  // Backward compatibility for old data where only Student.parentId is populated.
  return Student.findOne({ _id: studentId, parentId });
}

module.exports = { getAuthorizedChildForParent };
