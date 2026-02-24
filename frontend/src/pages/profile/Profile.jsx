import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../services/api";

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profilePhoto: "",
    password: "",
    role: "",
  });
  const [photoFileName, setPhotoFileName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/auth/me");
      const u = res.data || {};
      setForm((f) => ({
        ...f,
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        profilePhoto: u.profilePhoto || "",
        role: u.role || "",
      }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        profilePhoto: form.profilePhoto,
      };
      if (form.password.trim()) payload.password = form.password;
      const res = await API.put("/auth/me", payload);
      setMessage("Profile updated.");
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: {
            name: res.data?.name || form.name,
            profilePhoto: res.data?.profilePhoto || form.profilePhoto || "",
          },
        }),
      );
      setForm((f) => ({
        ...f,
        password: "",
        role: res.data?.role || f.role,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function compressImageDataUrl(dataUrl, maxSize = 1024, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to process image"));
        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG to keep payload compact for all image types including PNG.
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const rawDataUrl = await fileToDataUrl(file);
      const processedDataUrl = file.type.startsWith("image/")
        ? await compressImageDataUrl(rawDataUrl)
        : rawDataUrl;

      if (processedDataUrl.length > 10 * 1024 * 1024) {
        setError("Image is too large. Please choose a smaller photo.");
        return;
      }

      setForm((f) => ({ ...f, profilePhoto: processedDataUrl }));
      setPhotoFileName(file.name);
    } catch {
      setError("Failed to process selected image.");
    }
  }

  function handleRemovePhoto() {
    setForm((f) => ({ ...f, profilePhoto: "" }));
    setPhotoFileName("");
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      await API.delete("/auth/me");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Profile Settings</h1>
        {loading ? (
          <div className="bg-white rounded shadow p-4 text-gray-600">Loading profile...</div>
        ) : (
          <form onSubmit={saveProfile} className="bg-white rounded shadow p-4 space-y-3">
            {message && <div className="text-green-600">{message}</div>}
            {error && <div className="text-red-600">{error}</div>}

            <div className="flex items-center gap-4">
              <img
                src={
                  form.profilePhoto ||
                  "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/user.svg"
                }
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="flex-1">
                <label className="text-sm text-gray-600">Upload Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="border px-3 py-2 rounded w-full"
                />
                <div className="mt-2 flex items-center gap-2">
                  {photoFileName && <div className="text-xs text-gray-600">{photoFileName}</div>}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Role</label>
              <input
                value={form.role}
                disabled
                className="border px-3 py-2 rounded w-full bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">New Password (optional)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="border px-3 py-2 rounded w-full"
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Profile;
