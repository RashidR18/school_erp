import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Students() {
  const role = localStorage.getItem("role");
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [promotingId, setPromotingId] = useState(null);
  const [autoPromoting, setAutoPromoting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detailsMap, setDetailsMap] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [klassFilter, setKlassFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    className: "1",
    division: "A",
    parentId: "",
  });

  const classes = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const divisions = ["A", "B", "C"];

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const classOk = !klassFilter || String(s.className || "") === klassFilter;
      const divisionOk = !divisionFilter || String(s.division || "") === divisionFilter;
      return classOk && divisionOk;
    });
  }, [students, klassFilter, divisionFilter]);

  useEffect(() => {
    fetchStudents();
    if (role === "admin") fetchParents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchParents() {
    try {
      const res = await API.get("/auth/users", { params: { role: "parent" } });
      setParents(Array.isArray(res.data) ? res.data : []);
    } catch {
      setParents([]);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        name: form.name.trim(),
        rollNo: form.rollNo.trim(),
        className: form.className,
        division: form.division,
        parentId: form.parentId || undefined,
      };
      const res = await API.post("/students", payload);
      const created = res?.data;
      if (created?.skipped) {
        setMessage(created.message || "Student already exists. Skipped.");
      } else {
        setStudents((prev) => [created, ...prev]);
        setMessage("Student added");
      }
      setForm({ name: "", rollNo: "", className: "1", division: "A", parentId: "" });
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleDetails(studentId) {
    if (detailsMap[studentId]) {
      setDetailsMap((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
      return;
    }

    setDetailsLoading((prev) => ({ ...prev, [studentId]: true }));
    try {
      const [attendanceRes, feeRes] = await Promise.allSettled([
        API.get(`/attendance/${studentId}`),
        API.get(`/fees/${studentId}`),
      ]);

      const attendanceRecords =
        attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value?.data)
          ? attendanceRes.value.data
          : [];
      const present = attendanceRecords.filter((r) => r.status === "present").length;

      const fee =
        feeRes.status === "fulfilled" && feeRes.value?.data && typeof feeRes.value.data === "object"
          ? feeRes.value.data
          : null;

      setDetailsMap((prev) => ({
        ...prev,
        [studentId]: {
          attendanceTotal: attendanceRecords.length,
          attendancePresent: present,
          attendanceAbsent: attendanceRecords.length - present,
          feeTotal: Number(fee?.totalAmount || 0),
          feePaid: Number(fee?.paidAmount || 0),
        },
      }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [studentId]: false }));
    }
  }

  async function promoteManually(studentId) {
    if (role !== "admin") return;
    const confirmed = window.confirm("Promote this student to the next class?");
    if (!confirmed) return;

    setPromotingId(studentId);
    setError(null);
    setMessage(null);
    try {
      const res = await API.post(`/students/promote/${studentId}`, { studentId });
      setMessage(
        `${res.data?.name || "Student"} promoted from class ${res.data?.fromClass} to ${res.data?.toClass}.`,
      );
      await fetchStudents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Manual promotion failed");
    } finally {
      setPromotingId(null);
    }
  }

  async function runAutoPromotion() {
    if (role !== "admin") return;
    const confirmed = window.confirm(
      "Run yearly auto-promotion for all passed students now?",
    );
    if (!confirmed) return;

    setAutoPromoting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await API.post("/students/promote/auto", {});
      setMessage(
        `Auto promotion done. Promoted: ${res.data?.promotedCount || 0}, Skipped: ${
          res.data?.skippedCount || 0
        }.`,
      );
      await fetchStudents();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Auto promotion failed");
    } finally {
      setAutoPromoting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Students</h1>
          <div className="flex gap-2">
            {role === "admin" && (
              <button
                onClick={runAutoPromotion}
                disabled={autoPromoting}
                className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {autoPromoting ? "Running..." : "Run Auto Promotion"}
              </button>
            )}
            {(role === "admin" || role === "teacher") && (
              <button onClick={() => setShowForm((v) => !v)} className="bg-blue-600 text-white px-4 py-2 rounded">
                {showForm ? "Close" : "+ Add Student"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          {message && <div className="mb-3 text-green-600">{message}</div>}
          {error && <div className="mb-3 text-red-600">{error}</div>}

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={klassFilter}
              onChange={(e) => setKlassFilter(e.target.value)}
              className="border px-2 py-2 rounded w-full"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>{`Class ${c}`}</option>
              ))}
            </select>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="border px-2 py-2 rounded w-full"
            >
              <option value="">All Divisions</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  Division {d}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredStudents.length} student(s)
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="mb-4 p-3 border rounded bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="border px-2 py-2 rounded w-full"
                  required
                />
                <input
                  placeholder="Roll No"
                  value={form.rollNo}
                  onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))}
                  className="border px-2 py-2 rounded w-full"
                  required
                />
                <select
                  value={form.className}
                  onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                  className="border px-2 py-2 rounded w-full"
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>{`Class ${c}`}</option>
                  ))}
                </select>
                <select
                  value={form.division}
                  onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
                  className="border px-2 py-2 rounded w-full"
                >
                  {divisions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  className="border px-2 py-2 rounded w-full"
                >
                  <option value="">No Parent Linked</option>
                  {parents.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <button type="submit" disabled={saving} className="bg-green-600 text-white px-3 py-2 rounded">
                  {saving ? "Saving..." : "Save"}
                </button>
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
                    <th className="py-2">Roll No</th>
                    <th className="py-2">Class</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const id = s._id || s.id;
                    const details = detailsMap[id];
                    const parentName =
                      typeof s.parentId === "object" && s.parentId
                        ? s.parentId.name
                        : "";
                    return (
                      <tr key={id} className="border-b">
                        <td className="py-3">{idx + 1}</td>
                        <td className="py-3">{s.name}</td>
                        <td className="py-3">{s.rollNo}</td>
                        <td className="py-3">{s.className} {s.division ? `- ${s.division}` : ""}</td>
                        <td className="py-3">
                          <div className="flex gap-2 items-center">
                            <button onClick={() => toggleDetails(id)} className="px-3 py-1 bg-gray-200 rounded">
                              {details ? "Hide" : detailsLoading[id] ? "Loading..." : "Details"}
                            </button>
                            {role === "admin" && (
                              <button
                                onClick={() => promoteManually(id)}
                                disabled={promotingId === id}
                                className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60"
                              >
                                {promotingId === id ? "Promoting..." : "Promote"}
                              </button>
                            )}
                            <Link
                              to={`/attendance?studentId=${encodeURIComponent(id)}&name=${encodeURIComponent(s.name || "")}`}
                              className="px-3 py-1 bg-blue-600 text-white rounded"
                            >
                              Attendance
                            </Link>
                          </div>
                          {details && (
                            <div className="mt-2 text-sm text-gray-600">
                              Attendance: {details.attendancePresent}/{details.attendanceTotal} present | Fee Paid:
                              {" "}{details.feePaid} / {details.feeTotal}
                            </div>
                          )}
                          {parentName && (
                            <div className="mt-1 text-xs text-gray-500">
                              Parent: {parentName}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
