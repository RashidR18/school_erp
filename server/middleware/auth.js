const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (roles = []) => {
  const normalizedRoles = roles.map((r) => String(r).trim().toLowerCase());

  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing auth token" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = decoded.id ? await User.findById(decoded.id).select("role") : null;
      const tokenRole = String(decoded.role || "").trim().toLowerCase();
      const dbRole = String(user?.role || "").trim().toLowerCase();
      const userRole = dbRole || tokenRole;

      // Treat admin as superuser for protected routes.
      if (userRole === "admin") {
        req.user = { ...decoded, role: userRole };
        return next();
      }

      // Backward-compatible mode: if legacy data has no role, allow request
      // and rely on route/controller behavior instead of hard 403.
      if (normalizedRoles.length && userRole && !normalizedRoles.includes(userRole)) {
        return res.status(403).json({
          message: `Forbidden for role '${userRole || "unknown"}'`,
        });
      }

      req.user = { ...decoded, role: userRole };
      next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
