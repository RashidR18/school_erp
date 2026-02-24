const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedRole = String(role || "").trim().toLowerCase();
  if (!["admin", "teacher", "parent"].includes(normalizedRole)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: normalizedRole,
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json("Invalid");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json("Invalid");

  const token = jwt.sign(
    { id: user._id, role: String(user.role || "").trim().toLowerCase() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.json({ token, role: String(user.role || "").trim().toLowerCase() });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("linkedStudentIds", "name rollNo className division");

  if (!user) return res.sendStatus(404);
  res.json(user);
};

exports.getUsers = async (req, res) => {
  const { role } = req.query;
  const normalizedRole = role ? String(role).trim().toLowerCase() : null;
  const users = await User.find().select("_id name email role");

  const filtered = normalizedRole
    ? users.filter(
        (u) => String(u.role || "").trim().toLowerCase() === normalizedRole,
      )
    : users;

  res.json(filtered);
};

exports.updateMe = async (req, res) => {
  const { name, email, password, phone, profilePhoto } = req.body;
  const updates = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof email === "string" && email.trim()) updates.email = email.trim().toLowerCase();
  if (typeof phone === "string") updates.phone = phone.trim();
  if (typeof profilePhoto === "string") updates.profilePhoto = profilePhoto.trim();
  if (typeof password === "string" && password.trim()) {
    updates.password = await bcrypt.hash(password, 10);
  }

  const updated = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updated) return res.sendStatus(404);
  res.json(updated);
};

exports.deleteMe = async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.user.id);
  if (!deleted) return res.sendStatus(404);
  res.json({ message: "Account deleted successfully" });
};
