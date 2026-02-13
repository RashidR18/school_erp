import { Link, useLocation } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUserGraduate, FaChalkboardTeacher, FaMoneyBillWave } from "react-icons/fa";
import { HiClipboardDocumentCheck } from "react-icons/hi2";

function Sidebar(){
  const location = useLocation();

  const menu = [
    {name:"Dashboard",path:"/dashboard",icon:<MdDashboard/>},
    {name:"Students",path:"/students",icon:<FaUserGraduate/>},
    {name:"Teachers",path:"/teachers",icon:<FaChalkboardTeacher/>},
    {name:"Attendance",path:"/attendance",icon:<HiClipboardDocumentCheck/>},
    {name:"Fees",path:"/fees",icon:<FaMoneyBillWave/>},
  ];

  return(
    <div className="w-64 h-screen fixed bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 hidden md:block">
      
      <h1 className="text-2xl font-bold mb-10 text-blue-400">
        🎓 School ERP
      </h1>

      <ul className="space-y-4">
        {menu.map((item,i)=>(
          <li key={i}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                location.pathname===item.path
                ? "bg-blue-600"
                : "hover:bg-white/10"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  )
}

export default Sidebar;
