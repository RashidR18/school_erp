import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({children}){
  return(
    <div className="flex">
      
      <Sidebar/>

      <div className="flex-1 md:ml-64 p-6">
        <Navbar/>
        {children}
      </div>

    </div>
  )
}

export default DashboardLayout;
