import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Attendance() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [date, setDate] = useState(todayISO);
  const [month, setMonth] = useState(currentMonth);
  const [klass, setKlass] = useState("1");
  const [division, setDivision] = useState("A");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [studentRecords, setStudentRecords] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [viewMode, setViewMode] = useState("mark");
  const [savedClassAttendance, setSavedClassAttendance] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const studentIdParam = params.get("studentId");
  const studentNameParam = params.get("name");
  const role = localStorage.getItem("role");

  const isParent = role === "parent";
  const studentView = isParent || Boolean(studentIdParam);
  const activeStudentId = isParent ? selectedStudent : studentIdParam;
  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const divisions = ["A", "B", "C"];

  useEffect(() => {
    if (isParent) {
      fetchParentStudents();
      return;
    }
    if (!studentView) fetchStudents();
  }, [isParent, studentView, klass, division, viewMode]);

  useEffect(() => {
    if (studentView && activeStudentId) fetchStudentRecords(activeStudentId);
  }, [studentView, activeStudentId, role]);

  const monthlyStudentRecords = useMemo(() => {
    if (!month) return studentRecords;
    return studentRecords.filter((r) => {
      if (!r.date) return false;
      return new Date(r.date).toISOString().slice(0, 7) === month;
    });
  }, [studentRecords, month]);

  const monthlyPresent = monthlyStudentRecords.filter((r) => r.status === "present").length;
  const monthlyAbsent = monthlyStudentRecords.filter((r) => r.status === "absent").length;

  async function fetchParentStudents() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await API.get("/auth/me");
      const linked = Array.isArray(meRes.data?.linkedStudentIds)
        ? meRes.data.linkedStudentIds
        : [];
      setStudents(linked);
      setSelectedStudent((prev) => prev || linked[0]?._id || "");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/students");
      const data = Array.isArray(res.data) ? res.data : [];
      const filtered = data.filter(
        (s) => String(s.className || "") === klass && String(s.division || "") === division,
      );
      setStudents(filtered);
      const init = {};
      filtered.forEach((s) => {
        init[s._id] = "present";
      });
      setAttendance(init);
      if (viewMode === "view") {
        await fetchClassAttendanceForDate(filtered, date);
      } else {
        setSavedClassAttendance({});
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClassAttendanceForDate(classStudents, targetDate) {
    try {
      const targetIso = new Date(targetDate).toISOString().slice(0, 10);
      const rows = {};
      await Promise.all(
        classStudents.map(async (student) => {
          try {
            const res = await API.get(`/attendance/${student._id}`);
            const records = Array.isArray(res.data) ? res.data : [];
            const match = records.find((r) => {
              if (!r?.date) return false;
              return new Date(r.date).toISOString().slice(0, 10) === targetIso;
            });
            rows[student._id] = match?.status || "not marked";
          } catch {
            rows[student._id] = "not marked";
          }
        }),
      );
      setSavedClassAttendance(rows);
    } catch {
      setSavedClassAttendance({});
    }
  }

  async function fetchStudentRecords(studentId) {
    setStudentLoading(true);
    setError(null);
    try {
      const path = isParent ? `/attendance/parent/${studentId}` : `/attendance/${studentId}`;
      const res = await API.get(path);
      const records = Array.isArray(res.data) ? res.data : [];
      const list = records
        .map((r) => ({
          date: r.date || null,
          status: r.status || "absent",
        }))
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setStudentRecords(list);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load attendance");
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
      next[s._id] = status;
    });
    setAttendance(next);
  }

  async function handleSave() {
    if (role !== "teacher" && role !== "admin") {
      setError("Only teacher or admin role can mark attendance.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await Promise.all(
        students.map((s) =>
          API.post("/attendance", {
            studentId: s._id,
            date,
            status: attendance[s._id] || "absent",
          }),
        ),
      );
      setMessage("Attendance saved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save attendance");
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
            {studentView && (
              <div className="mt-1 text-sm text-gray-600">
                Showing records for:{" "}
                <span className="font-medium">{studentNameParam || activeStudentId}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {isParent && (
              <select
                className="border px-3 py-2 rounded"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={students.length === 0 || loading}
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
                </select>
            )}
            {studentView && (
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border px-3 py-2 rounded"
              />
            )}
            {!studentView && (
              <>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border px-3 py-2 rounded" />
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
                {(role === "teacher" || role === "admin") && (
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="border px-3 py-2 rounded"
                  >
                    <option value="mark">Mark Attendance</option>
                    <option value="view">View Saved Attendance</option>
                  </select>
                )}
              </>
            )}
            {!isParent && studentView && (
              <button onClick={() => navigate("/attendance")} className="px-3 py-1 border rounded">
                Back
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded shadow p-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading students...</div>
          ) : studentView ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="border rounded p-3 bg-green-50">
                  <div className="text-sm text-gray-600">Present (Month)</div>
                  <div className="font-semibold text-green-700">{monthlyPresent}</div>
                </div>
                <div className="border rounded p-3 bg-red-50">
                  <div className="text-sm text-gray-600">Absent (Month)</div>
                  <div className="font-semibold text-red-700">{monthlyAbsent}</div>
                </div>
                <div className="border rounded p-3 bg-blue-50">
                  <div className="text-sm text-gray-600">Total Records (Month)</div>
                  <div className="font-semibold text-blue-700">{monthlyStudentRecords.length}</div>
                </div>
              </div>
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
                      {monthlyStudentRecords.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-6 text-center text-gray-500">
                            No records found for selected month
                          </td>
                        </tr>
                      ) : (
                        monthlyStudentRecords.map((r, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  r.status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : viewMode === "view" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Roll No</th>
                    <th className="py-2">Saved Status ({date})</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        No students found for selected class/division
                      </td>
                    </tr>
                  ) : (
                    students.map((s, idx) => {
                      const status = savedClassAttendance[s._id] || "not marked";
                      return (
                        <tr key={s._id} className="border-b">
                          <td className="py-3">{idx + 1}</td>
                          <td className="py-3">{s.name}</td>
                          <td className="py-3">{s.rollNo}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : status === "absent"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button onClick={() => markAll("present")} className="bg-green-500 text-white px-3 py-1 rounded">
                    Mark All Present
                  </button>
                  <button onClick={() => markAll("absent")} className="bg-red-500 text-white px-3 py-1 rounded">
                    Mark All Absent
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || (role !== "teacher" && role !== "admin")}
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600 border-b">
                      <th className="py-2">#</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Roll No</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => {
                      const status = attendance[s._id] || "absent";
                      return (
                        <tr key={s._id} className="border-b">
                          <td className="py-3">{idx + 1}</td>
                          <td className="py-3">{s.name}</td>
                          <td className="py-3">{s.rollNo}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3">
                            <button onClick={() => toggle(s._id)} className="px-3 py-1 rounded border">
                              Toggle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {message && <div className="mt-4 text-green-600">{message}</div>}
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Attendance;
