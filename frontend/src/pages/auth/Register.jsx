import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "parent",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await API.post("/auth/register", form);
      setMessage("Registration successful. Please login.");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const serverError = err?.response?.data;
      setError(
        typeof serverError === "string"
          ? serverError
          : serverError?.message || "Registration failed",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-xl p-6 md:p-10 rounded-2xl w-full max-w-md shadow-2xl border border-white/20"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Register</h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 mb-4 rounded bg-white/20 outline-none text-white placeholder:text-gray-200"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-white/20 outline-none text-white placeholder:text-gray-200"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-white/20 outline-none text-white placeholder:text-gray-200"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />

        <select
          className="w-full p-3 mb-6 rounded bg-white/20 outline-none text-white"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
        >
          <option value="parent">Parent</option>
          <option value="teacher">Teacher</option>
        </select>

        {message && <p className="text-green-300 text-center mb-4">{message}</p>}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 p-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-60 text-white"
        >
          {saving ? "Registering..." : "Register"}
        </button>

        <p className="text-sm mt-4 text-center text-gray-300">
          Already have an account? <Link className="underline" to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
