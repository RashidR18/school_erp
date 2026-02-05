import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    students: 0,
    teachers: 0,
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
      const [sRes, tRes, fRes] = await Promise.allSettled([
        API.get("/students"),
        API.get("/teachers"),
        API.get("/fees"),
      ]);

      let students = 0;
      if (sRes.status === "fulfilled") {
        const sd = sRes.value?.data || [];
        students = Array.isArray(sd) ? sd.length : Number(sd.count) || 0;
      }

      let teachers = 0;
      if (tRes.status === "fulfilled") {
        const td = tRes.value?.data || [];
        teachers = Array.isArray(td) ? td.length : Number(td.count) || 0;
      }

      let totalFees = 0;
      let paidFees = 0;
      if (fRes.status === "fulfilled") {
        const fd = fRes.value?.data || [];
        if (Array.isArray(fd)) {
          fd.forEach((s) => {
            const t = Number(s.total ?? s.totalFees ?? 0);
            const p = Number(s.paid ?? s.paidAmount ?? 0);
            totalFees += t;
            paidFees += p;
          });
        } else if (fd && typeof fd === "object") {
          // support an object summary response
          totalFees = Number(fd.total ?? fd.totalFees ?? 0);
          paidFees = Number(fd.paid ?? fd.paidFees ?? 0);
        }
      }

      const pendingFees = Math.max(0, totalFees - paidFees);

      setMetrics({ students, teachers, totalFees, paidFees, pendingFees });
    } catch (err) {
      setError(err?.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-600">Total Students</h2>
          <p className="text-2xl font-bold">{loading ? "..." : metrics.students}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-600">Total Teachers</h2>
          <p className="text-2xl font-bold">{loading ? "..." : metrics.teachers}</p>
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
    </DashboardLayout>
  );
}

export default AdminDashboard;
