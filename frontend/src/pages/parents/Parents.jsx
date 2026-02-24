import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Parents() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchParents();
  }, []);

  async function fetchParents() {
    setLoading(true);
    try {
      const res = await API.get("/auth/users", { params: { role: "parent" } });
      setParents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load parents");
      setParents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "parent",
      });
      setMessage("Parent account created.");
      setForm({ name: "", email: "", password: "" });
      await fetchParents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create parent");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-4 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-4 md:p-6 mb-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaUsers className="text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-semibold">Parents</h1>
          </div>
          <p className="text-sm text-slate-600">
            Manage parent accounts for student communication and progress tracking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow p-4"
          >
            <h2 className="text-lg font-semibold mb-3">Create Parent Account</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                placeholder="Parent Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                placeholder="Parent Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-60 w-full"
              >
                {saving ? "Creating..." : "Create Parent"}
              </button>
            </form>
            {message && <div className="mt-3 text-green-600">{message}</div>}
            {error && <div className="mt-3 text-red-600">{error}</div>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow p-4"
          >
            <h2 className="text-lg font-semibold mb-3">Registered Parents</h2>
            {loading ? (
              <div className="text-slate-500">Loading...</div>
            ) : parents.length === 0 ? (
              <div className="text-slate-500">No parent records.</div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {parents.map((p) => (
                  <div key={p._id} className="border rounded p-2 bg-slate-50">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-slate-600">{p.email}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Parents;
