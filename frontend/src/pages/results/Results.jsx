import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

const EXAM_TYPES = ["class test", "internal", "external", "practical"];

function Results() {
  const currentYear = new Date().getFullYear();
  const role = localStorage.getItem("role");
  const isParent = role === "parent";
  const [students, setStudents] = useState([]);
  const [klass, setKlass] = useState("");
  const [division, setDivision] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [saveAcademicYear, setSaveAcademicYear] = useState(String(currentYear));
  const [allResults, setAllResults] = useState([]);
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [rows, setRows] = useState([
    { subject: "", marks: "", totalMarks: "100", examType: "class test" },
  ]);

  useEffect(() => {
    if (isParent) {
      loadParentChildren();
    } else {
      loadStudents();
    }
  }, [role, isParent]);

  const classOptions = useMemo(() => {
    const set = new Set(students.map((s) => String(s.className || "")).filter(Boolean));
    return Array.from(set);
  }, [students]);

  const divisionOptions = useMemo(() => {
    const base = students.filter((s) => !klass || String(s.className || "") === klass);
    const set = new Set(base.map((s) => String(s.division || "")).filter(Boolean));
    return Array.from(set);
  }, [students, klass]);

  const filteredStudents = useMemo(() => {
    if (isParent) return students;
    return students.filter((s) => {
      const classOk = !klass || String(s.className || "") === klass;
      const divisionOk = !division || String(s.division || "") === division;
      return classOk && divisionOk;
    });
  }, [students, klass, division, isParent]);

  useEffect(() => {
    if (filteredStudents.length === 0) {
      setSelectedStudent("");
      return;
    }
    const exists = filteredStudents.some((s) => s._id === selectedStudent);
    if (!exists) setSelectedStudent(filteredStudents[0]._id);
  }, [filteredStudents, selectedStudent]);

  useEffect(() => {
    if (selectedStudent) {
      loadResults(selectedStudent);
    }
  }, [selectedStudent, role]);

  useEffect(() => {
    const filtered = allResults.filter((r) => {
      const examOk =
        examFilter === "all" ||
        String(r.examType || "")
          .trim()
          .toLowerCase() === examFilter;
      const yearOk =
        yearFilter === "all" || Number(r.academicYear || currentYear) === Number(yearFilter);
      return examOk && yearOk;
    });
    setResults(filtered);
  }, [allResults, examFilter, yearFilter, currentYear]);

  useEffect(() => {
    if (selectedStudent) {
      loadLeaderboard(selectedStudent, examFilter, yearFilter);
    }
  }, [selectedStudent, examFilter, yearFilter]);

  async function loadStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/students");
      const list = Array.isArray(res.data) ? res.data : [];
      setStudents(list);
      if (list[0]?._id) {
        setKlass(String(list[0].className || ""));
        setDivision(String(list[0].division || ""));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  async function loadParentChildren() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await API.get("/auth/me");
      const linked = Array.isArray(meRes.data?.linkedStudentIds)
        ? meRes.data.linkedStudentIds
        : [];
      setStudents(linked);
      if (linked[0]?._id) {
        setKlass(String(linked[0].className || ""));
        setDivision(String(linked[0].division || ""));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function loadResults(studentId) {
    setLoading(true);
    setError(null);
    try {
      const path = role === "parent" ? `/results/parent/${studentId}` : `/results/${studentId}`;
      const res = await API.get(path);
      const data = Array.isArray(res.data) ? res.data : [];
      setAllResults(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load results");
      setAllResults([]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeaderboard(studentId, selectedExamType, selectedYear) {
    try {
      const res = await API.get(`/results/leaderboard/${studentId}`, {
        params: {
          examType: selectedExamType,
          academicYear: selectedYear === "all" ? undefined : Number(selectedYear),
        },
      });
      setLeaderboard(res.data || null);
    } catch {
      setLeaderboard(null);
    }
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { subject: "", marks: "", totalMarks: "100", examType: "class test" },
    ]);
  }

  function removeRow(index) {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateRow(index, key, value) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  async function saveResult(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payloads = rows
        .map((r) => ({
          studentId: selectedStudent,
          subject: String(r.subject || "").trim(),
          marks: Number(r.marks || 0),
          totalMarks: Number(r.totalMarks || 0),
          examType: String(r.examType || "").trim().toLowerCase(),
          academicYear: Number(saveAcademicYear || currentYear),
        }))
        .filter((r) => r.subject && r.totalMarks > 0);

      if (payloads.length === 0) {
        setError("Add at least one valid subject row.");
        return;
      }

      await Promise.all(payloads.map((payload) => API.post("/results", payload)));
      setMessage(`${payloads.length} result(s) saved.`);
      setRows([{ subject: "", marks: "", totalMarks: "100", examType: "class test" }]);
      await loadResults(selectedStudent);
      await loadLeaderboard(selectedStudent, examFilter, yearFilter);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save result");
    }
  }

  const yearOptions = useMemo(() => {
    const set = new Set();
    allResults.forEach((r) => {
      const y = Number(r?.academicYear);
      if (Number.isInteger(y)) set.add(y);
    });
    set.add(currentYear);
    return Array.from(set).sort((a, b) => b - a);
  }, [allResults, currentYear]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Results</h1>

        {error && <div className="mb-3 text-red-600">{error}</div>}
        {message && <div className="mb-3 text-green-600">{message}</div>}

        <div className="bg-white rounded shadow p-4 mb-4">
          <div className={`grid gap-3 ${isParent ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
            {!isParent && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={klass}
                onChange={(e) => setKlass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            )}
            {!isParent && (
              <select
                className="border px-3 py-2 rounded w-full"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              >
                <option value="">All Divisions</option>
                {divisionOptions.map((d) => (
                  <option key={d} value={d}>
                    Division {d}
                  </option>
                ))}
              </select>
            )}
            <select
              className="border px-3 py-2 rounded w-full"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={filteredStudents.length === 0}
            >
              {filteredStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNo}) - Class {s.className}
                  {s.division ? `-${s.division}` : ""}
                </option>
              ))}
            </select>
            <select
              className="border px-3 py-2 rounded w-full"
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
            >
              <option value="all">all exam types</option>
              {EXAM_TYPES.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
            <select
              className="border px-3 py-2 rounded w-full"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">all academic years</option>
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {leaderboard && (
          <div className="bg-white rounded shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">
              Class {leaderboard.className}
              {leaderboard.division ? `-${leaderboard.division}` : ""} Ranking ({leaderboard.examType})
            </h2>
            <div className="text-sm text-gray-600 mb-2">Academic Year: {leaderboard.academicYear}</div>
            <div className="grid md:grid-cols-3 gap-3">
              {leaderboard.top3?.map((r) => (
                <div key={String(r.studentId)} className="border rounded p-3 bg-amber-50">
                  <div className="font-semibold">
                    {r.rank === 1 ? "1st" : r.rank === 2 ? "2nd" : "3rd"}: {r.name}
                  </div>
                  <div className="text-sm text-gray-700">
                    {r.obtained}/{r.total} ({r.percentage}%)
                  </div>
                </div>
              ))}
            </div>
            {leaderboard.myRank && (
              <div className="mt-3 text-sm text-blue-700 font-medium">
                Your selected student rank: #{leaderboard.myRank.rank} with{" "}
                {leaderboard.myRank.obtained}/{leaderboard.myRank.total} ({leaderboard.myRank.percentage}
                %)
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded shadow p-4">
          {(role === "teacher" || role === "admin") && selectedStudent && (
            <form onSubmit={saveResult} className="mb-4">
              <div className="space-y-2">
                <div className="grid md:grid-cols-6 gap-2">
                  <label className="md:col-span-2 text-sm text-gray-600 flex items-center">
                    Academic Year for Save
                  </label>
                  <select
                    className="border px-3 py-2 rounded md:col-span-2"
                    value={saveAcademicYear}
                    onChange={(e) => setSaveAcademicYear(e.target.value)}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {rows.map((row, idx) => (
                  <div key={idx} className="grid md:grid-cols-5 gap-2">
                    <input
                      className="border px-3 py-2 rounded"
                      placeholder="Subject"
                      value={row.subject}
                      onChange={(e) => updateRow(idx, "subject", e.target.value)}
                      required
                    />
                    <input
                      className="border px-3 py-2 rounded"
                      type="number"
                      placeholder="Marks Obtained"
                      value={row.marks}
                      onChange={(e) => updateRow(idx, "marks", e.target.value)}
                      required
                    />
                    <input
                      className="border px-3 py-2 rounded"
                      type="number"
                      placeholder="Total Marks"
                      value={row.totalMarks}
                      onChange={(e) => updateRow(idx, "totalMarks", e.target.value)}
                      required
                    />
                    <select
                      className="border px-3 py-2 rounded"
                      value={row.examType}
                      onChange={(e) => updateRow(idx, "examType", e.target.value)}
                    >
                      {EXAM_TYPES.map((exam) => (
                        <option key={exam} value={exam}>
                          {exam}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-60"
                      disabled={rows.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={addRow} className="bg-gray-700 text-white px-4 py-2 rounded">
                  Add Subject
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                  Save All Results
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-gray-500 py-6">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">Subject</th>
                    <th className="py-2">Academic Year</th>
                    <th className="py-2">Exam Type</th>
                    <th className="py-2">Marks (Out Of)</th>
                    <th className="py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td className="py-3 text-gray-500" colSpan={5}>
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => {
                      const marks = Number(r.marks || 0);
                      const total = Number(r.totalMarks || 0);
                      const percentage = total > 0 ? ((marks / total) * 100).toFixed(2) : "0.00";
                      return (
                        <tr key={r._id} className="border-b">
                          <td className="py-2">{r.subject}</td>
                          <td className="py-2">{r.academicYear || "-"}</td>
                          <td className="py-2">{r.examType}</td>
                          <td className="py-2">
                            {marks}/{total}
                          </td>
                          <td className="py-2">{percentage}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Results;
