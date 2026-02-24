import { useState } from "react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import loginSchoolImage from "../../assets/login-school.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", String(res.data.role || "").toLowerCase());
      navigate("/dashboard");
    } catch (err) {
      const serverError = err?.response?.data;
      setError(
        typeof serverError === "string"
          ? serverError
          : serverError?.message || "Invalid login credentials.",
      );
      console.log(err);
    }
  };


  return(
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-emerald-200 px-4">

      <motion.form 
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleLogin}
      className="bg-white/70 backdrop-blur-xl p-6 md:p-10 rounded-2xl w-full max-w-md shadow-2xl border border-white/70">

        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
            MEHS
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 text-slate-900">
          Marina School ERP
        </h1>
        <p className="text-center text-sm text-slate-600 mb-5">Login</p>

        <img
          src={loginSchoolImage}
          alt="School campus"
          className="w-full h-28 object-cover rounded-xl mb-4 border border-white/60"
        />

        <input
        type="email"
        placeholder="Email"
        className="w-full p-3 mb-4 rounded bg-white/90 outline-none text-slate-800 placeholder:text-slate-400 border border-slate-200"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        />

        <input
        type="password"
        placeholder="Password"
        className="w-full p-3 mb-6 rounded bg-white/90 outline-none text-slate-800 placeholder:text-slate-400 border border-slate-200"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-center mb-4">{error}</p>} {/* Display error message */}

        <button type="submit" className="w-full bg-blue-600 p-3 rounded-lg hover:bg-blue-700 font-semibold text-white">
          Login
        </button>

        <a
          href="https://marinaenglishhighschool.com/facilities/"
          target="_blank"
          rel="noreferrer"
          className="block mt-4 text-center text-sm text-blue-700 hover:text-blue-800 underline underline-offset-2"
        >
          Visit Marina English High School Website
        </a>

      </motion.form>
    </div>
  )
}

export default Login;
