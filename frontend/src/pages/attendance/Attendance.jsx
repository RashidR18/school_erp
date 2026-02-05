import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Attendance() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayISO);
  const [klass, setKlass] = useState("1");
  const [section, setSection] = useState("A");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const studentIdParam = params.get("studentId");
  const studentNameParam = params.get("name");

  const [studentView, setStudentView] = useState(Boolean(studentIdParam));
  const [studentRecords, setStudentRecords] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);

  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const sections = ["A", "B", "C"];

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [klass, section]);

  useEffect(() => {
    if (studentView && studentIdParam) fetchStudentRecords(studentIdParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentView, studentIdParam]);

  useEffect(() => {
    if (students.length) fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, students]);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/students", {
        params: { class: klass, section },
      });
      const data = res?.data || [];
      if (!Array.isArray(data) || data.length === 0) throw new Error("No students returned");
      setStudents(data);
      // initialize attendance defaults
      const init = {};
      data.forEach((s) => {
        init[s._id ?? s.id ?? s.studentId ?? s.roll] = "present";
      });
      setAttendance(init);
    } catch (err) {
      // fallback sample data if endpoint not available
      const sample = Array.from({ length: 8 }, (_, i) => ({
        id: `s-${klass}-${section}-${i + 1}`,
        name: `Student ${i + 1}`,
        roll: i + 1,
      }));
      setStudents(sample);
      const init = {};
      sample.forEach((s) => (init[s.id] = "present"));
      setAttendance(init);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendance() {
    try {
      const res = await API.get("/attendance", {
        params: { date, class: klass, section },
      });
      const records = res?.data?.records || res?.data || [];
      if (Array.isArray(records) && records.length) {
        const map = {};
        records.forEach((r) => {
          const id = r.studentId ?? r.id ?? r._id ?? r.roll;
          map[id] = r.status || r.attendance || "absent";
        });
        setAttendance((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      // ignore - attendance may not exist yet
    }
  }

  async function fetchStudentRecords(id) {
    setStudentLoading(true);
    try {
      const res = await API.get("/attendance", { params: { studentId: id } });
      const records = res?.data?.records || res?.data || [];
      // normalize to [{date,status}]
      const list = Array.isArray(records)
        ? records.map((r) => ({ date: r.date || r.recordDate || r.createdAt || null, status: r.status || r.attendance || r.present ? "present" : "absent" }))
        : [];
      setStudentRecords(list.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
    } catch (err) {
      setStudentRecords([]);
    } finally {
      setStudentLoading(false);
    }
  }

  function toggle(id) {
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === "present" ? "absent" : "present" }));
  }

  function markAll(status) {
    const next = {};
    students.forEach((s) => {
      const id = s._id ?? s.id ?? s.studentId ?? s.roll;
      next[id] = status;
    });
    setAttendance(next);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const records = students.map((s) => {
        const id = s._id ?? s.id ?? s.studentId ?? s.roll;
        return { studentId: id, status: attendance[id] ?? "absent" };
      });
      const payload = { date, class: klass, section, records };
      await API.post("/attendance", payload);
      setMessage("Attendance saved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Attendance</h1>
            <p className="text-sm text-gray-500">Mark and save daily attendance</p>
            {studentView && (
              <div className="mt-1 text-sm text-gray-600">Showing records for: <span className="font-medium">{studentNameParam || studentIdParam}</span></div>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {!studentView && (
              <>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
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
              </>
            )}
            {studentView && (
              <div className="flex gap-2">
                <button onClick={() => { setStudentView(false); navigate('/attendance'); }} className="px-3 py-1 border rounded">Back</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {!studentView && (
                <>
                  <button onClick={() => markAll("present")} className="bg-green-500 text-white px-3 py-1 rounded">Mark All Present</button>
                  <button onClick={() => markAll("absent")} className="bg-red-500 text-white px-3 py-1 rounded">Mark All Absent</button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!studentView && (
                <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60">
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              )}
            </div>
          </div>

          {studentView ? (
            <div>
              {studentLoading ? (
                <div className="py-8 text-center text-gray-500">Loading records...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-gray-600 border-b">
                        <th className="py-2">Date</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRecords.length === 0 ? (
                        <tr><td colSpan={2} className="py-6 text-center text-gray-500">No records found</td></tr>
                      ) : (
                        studentRecords.map((r, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                            <td className="py-3"><span className={`px-2 py-1 rounded text-sm ${r.status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{r.status}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-gray-500">Loading students...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Roll</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const id = s._id ?? s.id ?? s.studentId ?? s.roll ?? `i-${idx}`;
                    const name = s.name || s.fullName || `Student ${idx + 1}`;
                    const roll = s.roll ?? idx + 1;
                    const status = attendance[id] ?? "absent";
                    return (
                      <tr key={id} className="border-b">
                        <td className="py-3">{idx + 1}</td>
                        <td className="py-3">{name}</td>
                        <td className="py-3">{roll}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-sm ${status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3">
                          <button onClick={() => toggle(id)} className="px-3 py-1 rounded border">
                            Toggle
                          </button>
                        </td>
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

export default Attendance;
