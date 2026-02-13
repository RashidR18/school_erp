import { FaUserCircle } from "react-icons/fa";

function Navbar(){

  const logout=()=>{
    localStorage.removeItem("token");
    window.location="/";
  }

  return(
    <div className="flex justify-between items-center bg-white/10 backdrop-blur-lg p-4 rounded-xl mb-6">
      
      <h2 className="text-xl font-semibold">Admin Panel</h2>

      <div className="flex items-center gap-4">
        <FaUserCircle size={28}/>
        <button 
        onClick={logout}
        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>

    </div>
  )
}

export default Navbar;
