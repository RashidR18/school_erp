import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import DashboardLayout from "../../layout/DashboardLayout";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/users", {
        params: { role: "teacher" },
      });
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const onTeacherChange = (e) =>
    setTeacherForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createTeacher = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await API.post("/auth/register", {
        ...teacherForm,
        role: "teacher",
      });
      setMessage("Teacher account created successfully.");
      setTeacherForm({
        name: "",
        email: "",
        password: "",
        number: "",
      });
      fetchTeachers();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-4 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-4"
        >
          <h1 className="text-2xl font-semibold text-slate-900">Teachers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and manage teacher accounts from the admin panel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            onSubmit={createTeacher}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Create Teacher
            </h2>

            {error && (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}
            {message && (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                placeholder="Full name"
                value={teacherForm.name}
                onChange={onTeacherChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={teacherForm.email}
                onChange={onTeacherChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
              <input
                name="number"
                placeholder="Phone number"
                value={teacherForm.number}
                onChange={onTeacherChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={teacherForm.password}
                onChange={onTeacherChange}
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Teacher"}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Registered Teachers
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Teachers added by the school administration.
            </p>

            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading teachers...</p>
              ) : teachers.length === 0 ? (
                <p className="text-sm text-slate-500">No teachers found.</p>
              ) : (
                teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-slate-600">{teacher.email}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teachers;
