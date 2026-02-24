import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [metrics, setMetrics] = useState({
    students: 0,
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, usersRes] = await Promise.allSettled([
        API.get("/students"),
        API.get("/auth/users"),
      ]);

      const students =
        studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value?.data)
          ? studentsRes.value.data
          : [];
      const users =
        usersRes.status === "fulfilled" && Array.isArray(usersRes.value?.data)
          ? usersRes.value.data
          : [];
      const teacherList = users.filter(
        (u) => String(u.role || "").trim().toLowerCase() === "teacher",
      );
      const parentList = users.filter(
        (u) => String(u.role || "").trim().toLowerCase() === "parent",
      );

      setTeachers(teacherList);
      setParents(parentList);

      const fees = await Promise.all(
        students.map(async (s) => {
          try {
            const feeRes = await API.get(`/fees/${s._id}`);
            return feeRes?.data || null;
          } catch {
            return null;
          }
        }),
      );

      let totalFees = 0;
      let paidFees = 0;
      fees.forEach((f) => {
        totalFees += Number(f?.totalAmount || 0);
        paidFees += Number(f?.paidAmount || 0);
      });

      setMetrics({
        students: students.length,
        totalFees,
        paidFees,
        pendingFees: Math.max(0, totalFees - paidFees),
      });

      if (studentsRes.status !== "fulfilled" || usersRes.status !== "fulfilled") {
        setError("Some dashboard data could not be loaded. Check role/account mapping.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-600">Total Students</h2>
          <p className="text-2xl font-bold">{loading ? "..." : metrics.students}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-600">Total Fees</h2>
          <p className="text-2xl font-bold">{loading ? "..." : `₹${metrics.totalFees.toLocaleString()}`}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-600">Fees Collected</h2>
          <p className="text-2xl font-bold">{loading ? "..." : `₹${metrics.paidFees.toLocaleString()}`}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-600">Pending Fees</h2>
          <p className="text-2xl font-bold">{loading ? "..." : `₹${metrics.pendingFees.toLocaleString()}`}</p>
        </div>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Registered Teachers</h2>
          {teachers.length === 0 ? (
            <div className="text-gray-500">No teacher records.</div>
          ) : (
            <div className="space-y-2">
              {teachers.map((t) => (
                <div key={t._id} className="border rounded p-2">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Registered Parents</h2>
          {parents.length === 0 ? (
            <div className="text-gray-500">No parent records.</div>
          ) : (
            <div className="space-y-2">
              {parents.map((p) => (
                <div key={p._id} className="border rounded p-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
