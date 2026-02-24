import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

function DashboardLayout({children}){
  const [mobileOpen, setMobileOpen] = useState(false);

  return(
    <div className="flex min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-slate-100 text-slate-900">
      
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 md:ml-64 p-4 md:p-6 pb-24 md:pb-6">
        <Navbar onHamburgerClick={() => setMobileOpen((v) => !v)} />
        {children}
      </div>

    </div>
  )
}

export default DashboardLayout;
