import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import ParentDashboard from "./pages/dashboard/ParentDashboard";
import Students from "./pages/students/Students";
import Teachers from "./pages/teachers/Teachers";
import Parents from "./pages/parents/Parents";
import Attendance from "./pages/attendance/Attendance";
import Fees from "./pages/fees/Fees";
import Results from "./pages/results/Results";
import Profile from "./pages/profile/Profile";
import AboutSchool from "./pages/about/AboutSchool";

function RoleDashboard() {
  const role = localStorage.getItem("role");
  if (role === "teacher") return <TeacherDashboard />;
  if (role === "parent") return <ParentDashboard />;
  return <AdminDashboard />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <Parents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "parent"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "parent"]}>
              <Fees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "parent"]}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "parent"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about-school"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "parent"]}>
              <AboutSchool />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
