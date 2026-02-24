import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ParentDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [record, setRecord] = useState({ attendance: [], results: [], fee: null });

  useEffect(() => {
    fetchParentChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) fetchChildRecord(selectedChild);
  }, [selectedChild]);

  async function fetchParentChildren() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await API.get("/auth/me");
      const linked = Array.isArray(meRes.data?.linkedStudentIds)
        ? meRes.data.linkedStudentIds
        : [];
      setChildren(linked);
      setSelectedChild(linked[0]?._id || "");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load parent dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function fetchChildRecord(childId) {
    setLoading(true);
    setError(null);
    try {
      const [attendanceRes, resultRes, feeRes] = await Promise.allSettled([
        API.get(`/attendance/parent/${childId}`),
        API.get(`/results/parent/${childId}`),
        API.get(`/fees/parent/${childId}`),
      ]);

      const attendance =
        attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value.data)
          ? attendanceRes.value.data
          : [];
      const results =
        resultRes.status === "fulfilled" && Array.isArray(resultRes.value.data)
          ? resultRes.value.data
          : [];
      const fee =
        feeRes.status === "fulfilled" && feeRes.value?.data ? feeRes.value.data : null;

      setRecord({ attendance, results, fee });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load student records");
      setRecord({ attendance: [], results: [], fee: null });
    } finally {
      setLoading(false);
    }
  }

  const activeChild = children.find((c) => c._id === selectedChild);
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const monthlyAttendance = record.attendance.filter((a) => {
    if (!a?.date) return false;
    return new Date(a.date).toISOString().slice(0, 7) === currentMonthKey;
  });
  const presentCount = monthlyAttendance.filter((a) => a.status === "present").length;
  const totalAttendance = monthlyAttendance.length;
  const attendanceChartData = [
    {
      name: "Current Month",
      attended: presentCount,
      held: totalAttendance,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>
        {loading && <div className="mb-3 text-gray-600">Loading...</div>}
        {error && <div className="mb-3 text-red-600">{error}</div>}

        {children.length === 0 ? (
          <div className="bg-white rounded shadow p-4 text-gray-600">
            No child linked yet. Ask admin to link your account with a student.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded shadow p-4">
              <label className="text-sm text-gray-600">Select Student</label>
              <select
                className="mt-1 border px-3 py-2 rounded w-full md:w-96"
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
              >
                {children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.name} ({child.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-semibold">
                {activeChild?.name} ({activeChild?.rollNo}) - Class {activeChild?.className}
                {activeChild?.division ? `-${activeChild.division}` : ""}
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mt-3">
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-600">Attendance (Current Month)</div>
                  <div className="font-semibold">
                    {presentCount}/{totalAttendance} present
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-600">Results</div>
                  <div className="font-semibold">{record.results.length} records</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-sm text-gray-600">Fees</div>
                  <div className="font-semibold">
                    Paid: {Number(record.fee?.paidAmount || 0)} / {Number(record.fee?.totalAmount || 0)}
                  </div>
                </div>
              </div>

              <div className="mt-4 border rounded p-3 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">
                  Attended Classes Out of Classes Held (Current Month)
                </div>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="held" fill="#93c5fd" name="Classes Held" />
                      <Bar dataKey="attended" fill="#22c55e" name="Attended Classes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-sm text-gray-600">
                      <th className="py-2">Subject</th>
                      <th className="py-2">Marks</th>
                      <th className="py-2">Exam Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.results.length === 0 ? (
                      <tr>
                        <td className="py-3 text-gray-500" colSpan={3}>
                          No result data
                        </td>
                      </tr>
                    ) : (
                      record.results.map((r) => (
                        <tr key={r._id} className="border-b">
                          <td className="py-2">{r.subject}</td>
                          <td className="py-2">{r.marks}</td>
                          <td className="py-2">{r.examType}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ParentDashboard;
