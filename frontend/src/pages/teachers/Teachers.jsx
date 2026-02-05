import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subjects: [] });

  const allSubjects = ["Math", "Science", "English", "History", "Geography", "Computer"];

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/teachers");
      const data = res?.data || [];
      // normalize
      const list = (Array.isArray(data) ? data : []).map((t) => ({
        id: t._id ?? t.id ?? t.teacherId,
        name: t.name,
        email: t.email,
        subjects: Array.isArray(t.subjects) ? t.subjects : t.subject ? [t.subject] : [],
      }));
      setTeachers(list);
    } catch (err) {
      // fallback sample
      setTeachers([
        { id: "t-1", name: "Ankit Sir", email: "ankit@gmail.com", subjects: ["Math"] },
        { id: "t-2", name: "Neha Maam", email: "neha@gmail.com", subjects: ["Science"] },
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", email: "", subjects: [] });
    setShowForm(true);
    setMessage(null);
  }

  function openEdit(t) {
    setEditing(t);
    setForm({ name: t.name || "", email: t.email || "", subjects: t.subjects || [] });
    setShowForm(true);
    setMessage(null);
  }

  function toggleSubject(sub) {
    setForm((f) => {
      const exists = (f.subjects || []).includes(sub);
      return { ...f, subjects: exists ? f.subjects.filter((s) => s !== sub) : [...(f.subjects || []), sub] };
    });
  }

  async function handleSave(e) {
    e && e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name: form.name, email: form.email, subjects: form.subjects };
      if (editing?.id) {
        await API.put(`/teachers/${editing.id}`, payload);
        setTeachers((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...payload } : t)));
        setMessage("Teacher updated");
      } else {
        const res = await API.post(`/teachers`, payload);
        const created = res?.data || { ...payload, id: res?.data?._id ?? Date.now().toString() };
        setTeachers((prev) => [ { id: created._id ?? created.id ?? created.id, ...payload }, ...prev ]);
        setMessage("Teacher added");
      }
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this teacher?")) return;
    setError(null);
    try {
      await API.delete(`/teachers/${id}`);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setMessage("Teacher deleted");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Teachers</h1>
          <div className="flex items-center gap-3">
            <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Teacher</button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          {message && <div className="mb-3 text-green-600">{message}</div>}
          {error && <div className="mb-3 text-red-600">{error}</div>}

          {showForm && (
            <form onSubmit={handleSave} className="mb-4 p-3 border rounded bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Name" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} className="border px-2 py-2 rounded" required />
                <input placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} className="border px-2 py-2 rounded" required />
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={saving} className="bg-green-600 text-white px-3 py-2 rounded">{saving?"Saving...":"Save"}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-2 border rounded">Cancel</button>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium mb-1">Subjects</div>
                <div className="flex flex-wrap gap-2">
                  {allSubjects.map((s)=>{
                    const checked = form.subjects.includes(s);
                    return (
                      <label key={s} className={`px-2 py-1 border rounded cursor-pointer ${checked?"bg-blue-100 border-blue-400":"bg-white"}`}>
                        <input type="checkbox" checked={checked} onChange={()=>toggleSubject(s)} className="mr-2" />
                        {s}
                      </label>
                    )
                  })}
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading teachers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">#</th>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Subjects</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, idx) => (
                    <tr key={t.id} className="border-b">
                      <td className="py-3">{idx + 1}</td>
                      <td className="py-3">{t.name}</td>
                      <td className="py-3">{t.email}</td>
                      <td className="py-3">{(t.subjects || []).join(", ")}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={()=>openEdit(t)} className="px-3 py-1 border rounded">Edit</button>
                          <button onClick={()=>handleDelete(t.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                        </div>
                      </td>
                    </tr>
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

export default Teachers;
