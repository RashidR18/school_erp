import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { HiMenuAlt2 } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

function Navbar({ onHamburgerClick = () => {} }){
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "admin";
  const [userName, setUserName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const roleTitle =
    role === "teacher" ? "Teacher Panel" : role === "parent" ? "Parent Panel" : "Admin Panel";

  useEffect(() => {
    fetchMe();
    function onProfileUpdated(event) {
      const nextName = String(event?.detail?.name || "");
      const nextPhoto = String(event?.detail?.profilePhoto || "");
      if (nextName) setUserName(nextName);
      setProfilePhoto(nextPhoto);
    }
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => window.removeEventListener("profile-updated", onProfileUpdated);
  }, []);

  async function fetchMe() {
    try {
      const res = await API.get("/auth/me");
      setUserName(String(res.data?.name || ""));
      setProfilePhoto(String(res.data?.profilePhoto || ""));
    } catch {
      setUserName("");
      setProfilePhoto("");
    }
  }

  const logout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location="/";
  }

  return(
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 border border-white/30 p-3 md:p-4 rounded-xl mb-4 md:mb-6 shadow"
    >
      
      <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onHamburgerClick}
          className="md:hidden p-2 rounded-lg bg-white/20 text-white"
        >
          <HiMenuAlt2 size={22} />
        </button>
        <div className="w-full">
          {userName && (
            <div className="text-base md:text-lg font-bold text-white rounded-xl px-2 py-1">
              Welcome, {userName} at {roleTitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-slate-300"
          />
        ) : (
          <FaUserCircle size={28} />
        )}
        <button
          onClick={() => navigate("/profile")}
          className="bg-white/20 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-white/30 text-sm md:text-base border border-white/30"
        >
          Profile Settings
        </button>
        <button 
        onClick={logout}
        className="bg-white/20 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-white/30 text-sm md:text-base border border-white/30">
          Logout
        </button>
      </div>

    </motion.div>
  )
}

export default Navbar;
