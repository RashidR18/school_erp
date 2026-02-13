import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", roll: "", class: "1", section: "A", email: "" });

  const [metrics, setMetrics] = useState({ students: 0, teachers: 0, paidFees: 0, pendingFees: 0 });
  const [detailsMap, setDetailsMap] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});

  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const sections = ["A", "B", "C"];

  useEffect(() => {
    fetchStudents();
    fetchMetrics();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/students");
      const data = res?.data || [];
      const normalized = (Array.isArray(data) ? data : []).map((s) => ({
        id: s._id ?? s.id ?? s.studentId,
        name: s.name,
        roll: s.roll ?? s.rollNo,
        class: s.class ?? s.grade ?? "1",
        section: s.section ?? "A",
        email: s.email,
      }));
      setStudents(normalized);
    } catch (err) {
      // fallback sample
      setStudents([
        { id: "s-1", name: "Rahul Sharma", roll: "1", class: "10", section: "A", email: "rahul@gmail.com" },
        { id: "s-2", name: "Amit Verma", roll: "2", class: "9", section: "B", email: "amit@gmail.com" },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetrics() {
    try {
      const [sRes, tRes, fRes] = await Promise.allSettled([API.get("/students"), API.get("/teachers"), API.get("/fees")]);
      let studentsCount = 0;
      if (sRes.status === "fulfilled") {
        const sd = sRes.value?.data || [];
        studentsCount = Array.isArray(sd) ? sd.length : Number(sd.count) || 0;
      }
      let teachersCount = 0;
      if (tRes.status === "fulfilled") {
        const td = tRes.value?.data || [];
        teachersCount = Array.isArray(td) ? td.length : Number(td.count) || 0;
      }
      let totalFees = 0;
      let paidFees = 0;
      if (fRes.status === "fulfilled") {
        const fd = fRes.value?.data || [];
        if (Array.isArray(fd)) {
          fd.forEach((s) => {
            totalFees += Number(s.total ?? s.totalFees ?? 0);
            paidFees += Number(s.paid ?? s.paidAmount ?? 0);
          });
        } else if (fd && typeof fd === "object") {
          totalFees = Number(fd.total ?? fd.totalFees ?? 0);
          paidFees = Number(fd.paid ?? fd.paidFees ?? 0);
        }
      }
      const pending = Math.max(0, totalFees - paidFees);
      setMetrics({ students: studentsCount, teachers: teachersCount, paidFees, pendingFees: pending });
    } catch (err) {
      // ignore metrics errors
    }
  }

  async function loadDetails(id, student) {
    if (detailsMap[id]) {
      // toggle off
      setDetailsMap((d) => {
        const copy = { ...d };
        delete copy[id];
        return copy;
      });
      return;
    }
    setDetailsLoading((l) => ({ ...l, [id]: true }));
    try {
      const [aRes, fRes, tRes] = await Promise.allSettled([
        API.get("/attendance", { params: { studentId: id } }),
        API.get("/fees", { params: { studentId: id } }),
        API.get("/teachers"),
      ]);

      // attendance summary
      let attendanceSummary = { total: 0, present: 0, absent: 0, percent: null, lastStatus: null };
      if (aRes.status === "fulfilled") {
        const arr = aRes.value?.data?.records || aRes.value?.data || [];
        if (Array.isArray(arr)) {
          attendanceSummary.total = arr.length;
          attendanceSummary.present = arr.filter((r) => (r.status || r.attendance) === "present").length;
          attendanceSummary.absent = attendanceSummary.total - attendanceSummary.present;
          attendanceSummary.percent = attendanceSummary.total ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100) : null;
          const last = arr[arr.length - 1];
          attendanceSummary.lastStatus = last ? (last.status || last.attendance || null) : null;
        }
      }

      // fees summary
      let fees = { total: 0, paid: 0, pending: 0 };
      if (fRes.status === "fulfilled") {
        const fd = fRes.value?.data || [];
        if (Array.isArray(fd)) {
          // find student entry
          const entry = fd.find((x) => (x.studentId ?? x.id ?? x._id) === id) || fd[0];
          fees.total = Number(entry?.total ?? entry?.totalFees ?? 0);
          fees.paid = Number(entry?.paid ?? entry?.paidAmount ?? 0);
        } else if (fd && typeof fd === "object") {
          fees.total = Number(fd.total ?? fd.totalFees ?? 0);
          fees.paid = Number(fd.paid ?? fd.paidFees ?? 0);
        }
        fees.pending = Math.max(0, fees.total - fees.paid);
      }

      // teacher mapping
      let teacherName = null;
      if (tRes.status === "fulfilled") {
        const td = tRes.value?.data || [];
        if (Array.isArray(td)) {
          const t = td.find((tt) => (tt._id ?? tt.id ?? tt.teacherId) === (student.teacherId ?? student.teacher));
          teacherName = t ? t.name : null;
        }
      }

      setDetailsMap((d) => ({ ...d, [id]: { attendance: attendanceSummary, fees, teacherName } }));
    } catch (err) {
      // ignore per-student errors
    } finally {
      setDetailsLoading((l) => ({ ...l, [id]: false }));
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", roll: "", class: "1", section: "A", email: "" });
    setShowForm(true);
    setMessage(null);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({ name: s.name || "", roll: s.roll || "", class: s.class || "1", section: s.section || "A", email: s.email || "" });
    setShowForm(true);
    setMessage(null);
  }

  async function handleSave(e) {
    e && e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name: form.name, roll: form.roll, class: form.class, section: form.section, email: form.email };
      if (editing?.id) {
        await API.put(`/students/${editing.id}`, payload);
        setStudents((prev) => prev.map((st) => (st.id === editing.id ? { ...st, ...payload } : st)));
        setMessage("Student updated");
      } else {
        const res = await API.post(`/students`, payload);
        const created = res?.data || { ...payload, id: res?.data?._id ?? Date.now().toString() };
        setStudents((prev) => [{ id: created._id ?? created.id ?? created.id, ...payload }, ...prev]);
        setMessage("Student added");
      }
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this student?")) return;
    setError(null);
    try {
      await API.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setMessage("Student deleted");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Students</h1>
          <div className="flex items-center gap-3">
            <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Student</button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          {message && <div className="mb-3 text-green-600">{message}</div>}
          {error && <div className="mb-3 text-red-600">{error}</div>}

          {showForm && (
            <form onSubmit={handleSave} className="mb-4 p-3 border rounded bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} className="border px-2 py-2 rounded" required />
                <input placeholder="Roll" value={form.roll} onChange={(e)=>setForm(f=>({...f,roll:e.target.value}))} className="border px-2 py-2 rounded" />
                <select value={form.class} onChange={(e)=>setForm(f=>({...f,class:e.target.value}))} className="border px-2 py-2 rounded">
                  {classes.map((c) => <option key={c} value={c}>{`Class ${c}`}</option>)}
                </select>
                <select value={form.section} onChange={(e)=>setForm(f=>({...f,section:e.target.value}))} className="border px-2 py-2 rounded">
                  {sections.map((s)=> <option key={s} value={s}>{s}</option>)}
                </select>
                <input placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} className="border px-2 py-2 rounded" />
              </div>

              <div className="mt-3 flex gap-2">
                <button type="submit" disabled={saving} className="bg-green-600 text-white px-3 py-2 rounded">{saving?"Saving...":"Save"}</button>
                <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading students...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Roll</th>
                    <th className="py-2">Class</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <>
                      <tr key={s.id} className="border-b">
                        <td className="py-3">{idx + 1}</td>
                        <td className="py-3">{s.name}</td>
                        <td className="py-3">{s.roll}</td>
                        <td className="py-3">{s.class} {s.section ? `-${s.section}` : ""}</td>
                        <td className="py-3">{s.email}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button onClick={()=>openEdit(s)} className="px-3 py-1 border rounded">Edit</button>
                            <button onClick={()=>handleDelete(s.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                            <button onClick={() => loadDetails(s.id, s)} className="px-3 py-1 bg-gray-200 rounded">
                              {detailsMap[s.id] ? "Hide" : detailsLoading[s.id] ? "Loading..." : "Details"}
                            </button>
                            <Link to={`/attendance?studentId=${encodeURIComponent(s.id)}&name=${encodeURIComponent(s.name)}`} className="px-3 py-1 bg-blue-600 text-white rounded">Attendance</Link>
                          </div>
                        </td>
                      </tr>
                      {detailsMap[s.id] && (
                        <tr key={`${s.id}-details`} className="bg-gray-50">
                          <td colSpan={6} className="p-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-gray-600">Assigned Teacher</div>
                                <div className="font-medium">{detailsMap[s.id].teacherName || "—"}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Attendance</div>
                                <div className="font-medium">Present: {detailsMap[s.id].attendance.present} / {detailsMap[s.id].attendance.total} {detailsMap[s.id].attendance.percent !== null ? `(${detailsMap[s.id].attendance.percent}%)` : ""}</div>
                                {detailsMap[s.id].attendance.lastStatus && <div className="text-sm text-gray-500">Last: {detailsMap[s.id].attendance.lastStatus}</div>}
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Fees</div>
                                <div className="font-medium">Total: ₹{(detailsMap[s.id].fees.total || 0).toLocaleString()}</div>
                                <div className="text-sm text-gray-700">Paid: ₹{(detailsMap[s.id].fees.paid || 0).toLocaleString()}</div>
                                <div className="text-sm text-red-600">Pending: ₹{(detailsMap[s.id].fees.pending || 0).toLocaleString()}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Students;
