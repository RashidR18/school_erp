import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Fees() {
  const [klass, setKlass] = useState("1");
  const [section, setSection] = useState("A");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState({});

  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const sections = ["A", "B", "C"];

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klass, section]);

  async function fetchFees() {
    setLoading(true);
    setError(null);
    try {
      // expected server endpoint: GET /fees?class=1&section=A
      const res = await API.get("/fees", { params: { class: klass, section } });
      const data = res?.data?.students || res?.data || [];
      if (!Array.isArray(data) || data.length === 0) throw new Error("No data");
      const normalized = data.map((s) => ({
        id: s._id ?? s.id ?? s.studentId ?? s.roll ?? `${s.roll}`,
        name: s.name || s.fullName || `Student ${s.roll ?? ""}`,
        roll: s.roll ?? s.rollNo ?? "-",
        total: Number(s.totalFees ?? s.total ?? 0),
        paid: Number(s.paid ?? s.paidAmount ?? 0),
      }));
      setStudents(normalized);
      const map = {};
      normalized.forEach((n) => (map[n.id] = ""));
      setPayments(map);
    } catch (err) {
      // fallback sample data
      const sample = Array.from({ length: 8 }, (_, i) => ({
        id: `s-${klass}-${section}-${i + 1}`,
        name: `Student ${i + 1}`,
        roll: i + 1,
        total: 10000,
        paid: Math.floor(Math.random() * 8000),
      }));
      setStudents(sample);
      const map = {};
      sample.forEach((n) => (map[n.id] = ""));
      setPayments(map);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  function pendingAmount(s) {
    return Math.max(0, (s.total || 0) - (s.paid || 0));
  }

  async function handlePay(id) {
    const raw = payments[id];
    const amt = Number(raw || 0);
    if (!amt || amt <= 0) return setError("Enter a valid amount to pay");
    setSavingId(id);
    setError(null);
    try {
      // expected endpoint: POST /fees/pay { studentId, amount }
      await API.post("/fees/pay", { studentId: id, amount: amt });
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, paid: Number(s.paid || 0) + amt } : s)));
      setPayments((p) => ({ ...p, [id]: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Payment failed");
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
            <p className="text-sm text-gray-500">Overview of fees per student with quick payments</p>
          </div>
          <div className="flex gap-3 items-center">
            <select value={klass} onChange={(e) => setKlass(e.target.value)} className="border px-3 py-2 rounded">
              {classes.map((c) => (
                <option key={c} value={c}>{`Class ${c}`}</option>
              ))}
            </select>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="border px-3 py-2 rounded">
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
                    <th className="py-2">Roll</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Paid</th>
                    <th className="py-2">Pending</th>
                    <th className="py-2">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-3">{idx + 1}</td>
                      <td className="py-3">{s.name}</td>
                      <td className="py-3">{s.roll}</td>
                      <td className="py-3">₹{(s.total || 0).toLocaleString()}</td>
                      <td className="py-3">₹{(s.paid || 0).toLocaleString()}</td>
                      <td className="py-3 text-red-600">₹{pendingAmount(s).toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={payments[s.id] ?? ""}
                            onChange={(e) => setPayments((p) => ({ ...p, [s.id]: e.target.value }))}
                            placeholder="Amount"
                            className="border px-2 py-1 rounded w-28"
                          />
                          <button
                            onClick={() => handlePay(s.id)}
                            disabled={savingId === s.id}
                            className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
                          >
                            {savingId === s.id ? "Saving..." : "Pay"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Fees;
