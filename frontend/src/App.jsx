import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Students from "./pages/students/Students";
import Teachers from "./pages/teachers/Teachers";
import Attendance from "./pages/attendance/Attendance";
import Fees from "./pages/fees/Fees";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/fees" element={<Fees />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
