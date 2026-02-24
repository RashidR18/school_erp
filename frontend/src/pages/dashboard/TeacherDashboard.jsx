import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function TeacherDashboard() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    day: "Monday",
    startTime: "",
    endTime: "",
    subject: "",
    className: "",
    division: "A",
    note: "",
  });
  const [schedule, setSchedule] = useState([]);

  const scheduleStorageKey = useMemo(() => {
    const id = me?._id || "teacher";
    return `teacher_schedule_${id}`;
  }, [me]);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (!scheduleStorageKey) return;
    try {
      const raw = localStorage.getItem(scheduleStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setSchedule(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSchedule([]);
    }
  }, [scheduleStorageKey]);

  useEffect(() => {
    if (!scheduleStorageKey) return;
    localStorage.setItem(scheduleStorageKey, JSON.stringify(schedule));
  }, [schedule, scheduleStorageKey]);

  async function fetchMe() {
    try {
      const res = await API.get("/auth/me");
      setMe(res.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load profile");
      setMe(null);
    }
  }

  function addScheduleItem(e) {
    e.preventDefault();
    if (!scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.subject) {
      setError("Please fill day, time, and subject for routine.");
      return;
    }
    setError(null);
    setMessage("Routine updated.");
    setSchedule((prev) => [
      ...prev,
      { ...scheduleForm, id: `${Date.now()}_${Math.random()}` },
    ]);
    setScheduleForm((f) => ({
      ...f,
      startTime: "",
      endTime: "",
      subject: "",
      className: "",
      note: "",
    }));
  }

  function removeScheduleItem(id) {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  }

  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return String(a.startTime).localeCompare(String(b.startTime));
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Teacher Dashboard</h1>
        {me?.name && <div className="text-sm text-slate-600 mb-4">Welcome, {me.name}</div>}
        {message && <div className="mb-3 text-green-600">{message}</div>}
        {error && <div className="mb-3 text-red-600">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <form onSubmit={addScheduleItem} className="bg-white rounded-xl shadow p-4 space-y-2">
            <h2 className="text-lg font-semibold">My Routine Scheduler</h2>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="border rounded px-3 py-2 w-full"
                value={scheduleForm.day}
                onChange={(e) => setScheduleForm((f) => ({ ...f, day: e.target.value }))}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="Subject"
                value={scheduleForm.subject}
                onChange={(e) => setScheduleForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                className="border rounded px-3 py-2 w-full"
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm((f) => ({ ...f, startTime: e.target.value }))}
              />
              <input
                type="time"
                className="border rounded px-3 py-2 w-full"
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="Class"
                value={scheduleForm.className}
                onChange={(e) => setScheduleForm((f) => ({ ...f, className: e.target.value }))}
              />
              <select
                className="border rounded px-3 py-2 w-full"
                value={scheduleForm.division}
                onChange={(e) => setScheduleForm((f) => ({ ...f, division: e.target.value }))}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <textarea
              className="border rounded px-3 py-2 w-full"
              placeholder="Note (optional)"
              value={scheduleForm.note}
              onChange={(e) => setScheduleForm((f) => ({ ...f, note: e.target.value }))}
              rows={2}
            />
            <button className="bg-purple-600 text-white px-4 py-2 rounded w-full" type="submit">
              Add To Routine
            </button>
          </form>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Planned Classes</h2>
            {sortedSchedule.length === 0 ? (
              <div className="text-gray-500">No routine added yet.</div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-auto pr-1">
                {sortedSchedule.map((item) => (
                  <div key={item.id} className="border rounded p-3 bg-slate-50">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-medium">
                          {item.day} {item.startTime} - {item.endTime}
                        </div>
                        <div className="text-sm text-slate-700">
                          {item.subject} | Class {item.className || "-"}-{item.division || "-"}
                        </div>
                        {item.note && <div className="text-xs text-slate-600 mt-1">{item.note}</div>}
                      </div>
                      <button
                        onClick={() => removeScheduleItem(item.id)}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TeacherDashboard;
