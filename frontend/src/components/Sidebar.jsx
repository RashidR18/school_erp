import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MdDashboard } from "react-icons/md";
import { FaUserGraduate, FaChalkboardTeacher, FaMoneyBillWave, FaUsers, FaSchool } from "react-icons/fa";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import { PiExamFill } from "react-icons/pi";

function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const adminMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
    { name: "Students", path: "/students", icon: <FaUserGraduate /> },
    { name: "Teachers", path: "/teachers", icon: <FaChalkboardTeacher /> },
    { name: "Parents", path: "/parents", icon: <FaUsers /> },
    { name: "Attendance", path: "/attendance", icon: <HiClipboardDocumentCheck /> },
    { name: "Fees", path: "/fees", icon: <FaMoneyBillWave /> },
    { name: "Results", path: "/results", icon: <PiExamFill /> },
    { name: "About School", path: "/about-school", icon: <FaSchool /> },
  ];

  const teacherMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
    { name: "Students", path: "/students", icon: <FaUserGraduate /> },
    { name: "Parents", path: "/parents", icon: <FaUsers /> },
    { name: "Attendance", path: "/attendance", icon: <HiClipboardDocumentCheck /> },
    { name: "Fees", path: "/fees", icon: <FaMoneyBillWave /> },
    { name: "Results", path: "/results", icon: <PiExamFill /> },
    { name: "About School", path: "/about-school", icon: <FaSchool /> },
  ];

  const parentMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
    { name: "Attendance", path: "/attendance", icon: <HiClipboardDocumentCheck /> },
    { name: "Fees", path: "/fees", icon: <FaMoneyBillWave /> },
    { name: "Results", path: "/results", icon: <PiExamFill /> },
    { name: "About School", path: "/about-school", icon: <FaSchool /> },
  ];

  const menu =
    role === "teacher" ? teacherMenu : role === "parent" ? parentMenu : adminMenu;

  const navLinks = (
    <ul className="space-y-3">
      {menu.map((item, idx) => (
        <motion.li
          key={item.path}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
        >
          <Link
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-50 text-slate-800"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        </motion.li>
      ))}
    </ul>
  );

  return (
    <>
      <div className="w-64 h-screen fixed overflow-y-auto bg-white/70 backdrop-blur-xl border-r border-white/80 p-6 hidden md:block">
        <div className="mb-10">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
            MEHS
          </div>
          <h1 className="text-xl font-bold mt-3 text-blue-700">Marina School ERP</h1>
        </div>
        {navLinks}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              className="md:hidden fixed inset-0 z-40 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="md:hidden fixed z-50 top-0 left-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-2xl"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  MEHS
                </div>
                <h1 className="text-xl font-bold mt-3 text-blue-700">Marina School ERP</h1>
              </div>
              {navLinks}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
