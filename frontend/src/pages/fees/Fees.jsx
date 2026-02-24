import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Fees() {
  const role = localStorage.getItem("role");
  const isParent = role === "parent";
  const canEditFees = role === "admin";
  const [klass, setKlass] = useState("1");
  const [division, setDivision] = useState("A");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [students, setStudents] = useState([]);
  const [parentChildren, setParentChildren] = useState([]);
  const [forms, setForms] = useState({});

  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const divisions = ["A", "B", "C"];

  useEffect(() => {
    if (isParent) {
      fetchParentFees();
      return;
    }
    fetchFees();
  }, [isParent, klass, division, selectedStudent]);

  async function fetchParentFees() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const meRes = await API.get("/auth/me");
      const linked = Array.isArray(meRes.data?.linkedStudentIds)
        ? meRes.data.linkedStudentIds
        : [];
      setParentChildren(linked);
      const currentStudentId = selectedStudent || linked[0]?._id || "";
      setSelectedStudent(currentStudentId);
      if (!currentStudentId) {
        setStudents([]);
        setParentChildren([]);
        setForms({});
        return;
      }

      const student = linked.find((s) => s._id === currentStudentId);
      const feeRes = await API.get(`/fees/parent/${currentStudentId}`);
      const fee = feeRes?.data || {};
      const row = {
        id: currentStudentId,
        name: student?.name || "Student",
        rollNo: student?.rollNo || "-",
        totalAmount: Number(fee.totalAmount || 0),
        paidAmount: Number(fee.paidAmount || 0),
        status: fee.status || "unpaid",
      };
      setStudents([row]);
      setForms({
        [row.id]: {
          totalAmount: String(row.totalAmount),
          paidAmount: String(row.paidAmount),
          status: row.status,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load fees");
      setStudents([]);
      setForms({});
    } finally {
      setLoading(false);
    }
  }

  async function fetchFees() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const studentsRes = await API.get("/students");
      const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const filtered = allStudents.filter(
        (s) => String(s.className || "") === klass && String(s.division || "") === division,
      );

      const rows = await Promise.all(
        filtered.map(async (s) => {
          try {
            const feeRes = await API.get(`/fees/${s._id}`);
            const fee = feeRes?.data || {};
            return {
              id: s._id,
              name: s.name,
              rollNo: s.rollNo,
              totalAmount: Number(fee.totalAmount || 0),
              paidAmount: Number(fee.paidAmount || 0),
              status: fee.status || "unpaid",
            };
          } catch {
            return {
              id: s._id,
              name: s.name,
              rollNo: s.rollNo,
              totalAmount: 0,
              paidAmount: 0,
              status: "unpaid",
            };
          }
        }),
      );

      setStudents(rows);
      const init = {};
      rows.forEach((r) => {
        init[r.id] = {
          totalAmount: r.totalAmount ? String(r.totalAmount) : "",
          paidAmount: r.paidAmount ? String(r.paidAmount) : "",
          status: r.status || "unpaid",
        };
      });
      setForms(init);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load fees");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(studentId) {
    if (!canEditFees) return;

    const form = forms[studentId] || {};
    const totalAmount = Number(form.totalAmount || 0);
    const paidAmount = Number(form.paidAmount || 0);
    const status = form.status || "unpaid";

    if (totalAmount < 0 || paidAmount < 0) {
      setError("Amounts cannot be negative.");
      return;
    }

    setSavingId(studentId);
    setError(null);
    setMessage(null);
    try {
      await API.post("/fees", {
        studentId,
        totalAmount,
        paidAmount,
        status,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, totalAmount, paidAmount, status } : s,
        ),
      );
      setMessage("Fee updated.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Fee save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Student Fees</h1>
            <p className="text-sm text-gray-500">
              {isParent ? "View your linked student fee details" : "Manage fees using backend fee routes"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {isParent ? (
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="border px-3 py-2 rounded"
                disabled={loading}
              >
                {parentChildren.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            ) : (
              <>
                <select value={klass} onChange={(e) => setKlass(e.target.value)} className="border px-3 py-2 rounded">
                  {classes.map((c) => (
                    <option key={c} value={c}>{`Class ${c}`}</option>
                  ))}
                </select>
                <select value={division} onChange={(e) => setDivision(e.target.value)} className="border px-3 py-2 rounded">
                  {divisions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded shadow p-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading fees...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Roll No</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Paid</th>
                    <th className="py-2">Pending</th>
                    <th className="py-2">Status</th>
                    {canEditFees && <th className="py-2">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const form = forms[s.id] || { totalAmount: "", paidAmount: "", status: "unpaid" };
                    const localTotal = Number(form.totalAmount || 0);
                    const localPaid = Number(form.paidAmount || 0);
                    return (
                      <tr key={s.id} className="border-b">
                        <td className="py-3">{idx + 1}</td>
                        <td className="py-3">{s.name}</td>
                        <td className="py-3">{s.rollNo}</td>
                        <td className="py-3">
                          <input
                            type="number"
                            min="0"
                            value={form.totalAmount}
                            onChange={(e) =>
                              setForms((prev) => ({
                                ...prev,
                                [s.id]: { ...form, totalAmount: e.target.value },
                              }))
                            }
                            disabled={!canEditFees}
                            className="border px-2 py-1 rounded w-28 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            min="0"
                            value={form.paidAmount}
                            onChange={(e) =>
                              setForms((prev) => ({
                                ...prev,
                                [s.id]: { ...form, paidAmount: e.target.value },
                              }))
                            }
                            disabled={!canEditFees}
                            className="border px-2 py-1 rounded w-28 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="py-3 text-red-600">₹{Math.max(0, localTotal - localPaid).toLocaleString()}</td>
                        <td className="py-3">
                          <select
                            value={form.status}
                            onChange={(e) =>
                              setForms((prev) => ({
                                ...prev,
                                [s.id]: { ...form, status: e.target.value },
                              }))
                            }
                            disabled={!canEditFees}
                            className="border px-2 py-1 rounded disabled:bg-gray-100"
                          >
                            <option value="paid">paid</option>
                            <option value="partial">partial</option>
                            <option value="unpaid">unpaid</option>
                          </select>
                        </td>
                        {canEditFees && (
                          <td className="py-3">
                            <button
                              onClick={() => handleSave(s.id)}
                              disabled={savingId === s.id}
                              className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
                            >
                              {savingId === s.id ? "Saving..." : "Save"}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {message && <div className="mt-4 text-green-600">{message}</div>}
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Fees;
