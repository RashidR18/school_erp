import { useState } from "react";

function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const handleLogin=(e)=>{
    e.preventDefault();

    if(email==="admin@gmail.com" && password==="123456"){
      localStorage.setItem("token","demo");
      window.location="/dashboard";
    }else{
      alert("Invalid credentials");
    }
  }

  return(
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-black">

      <form 
      onSubmit={handleLogin}
      className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl w-96 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          School ERP Login
        </h1>

        <input
        type="email"
        placeholder="Email"
        className="w-full p-3 mb-4 rounded bg-white/20 outline-none"
        onChange={(e)=>setEmail(e.target.value)}
        />

        <input
        type="password"
        placeholder="Password"
        className="w-full p-3 mb-6 rounded bg-white/20 outline-none"
        onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 p-3 rounded-lg hover:bg-blue-700 font-semibold">
          Login
        </button>

        <p className="text-sm mt-4 text-center text-gray-300">
          demo: admin@gmail.com / 123456
        </p>

      </form>
    </div>
  )
}

export default Login;
