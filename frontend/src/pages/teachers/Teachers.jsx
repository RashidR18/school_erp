import DashboardLayout from "../../layout/DashboardLayout";
import { useState } from "react";

function Teachers(){

  const [teachers] = useState([
    {id:1,name:"Ankit Sir",subject:"Math",email:"ankit@gmail.com"},
    {id:2,name:"Neha Maam",subject:"Science",email:"neha@gmail.com"},
    {id:3,name:"Rohit Sir",subject:"English",email:"rohit@gmail.com"},
  ]);

  return(
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teachers</h1>

        <button className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700">
          + Add Teacher
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Email</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((t)=>(
              <tr key={t.id} className="border-b border-gray-700">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.subject}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">
                  <button className="bg-red-500 px-3 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </DashboardLayout>
  )
}

export default Teachers;
