import DashboardLayout from "../../layout/DashboardLayout";
import { useState } from "react";

function Students(){

  const [students] = useState([
    {id:1,name:"Rahul Sharma",class:"10th",email:"rahul@gmail.com"},
    {id:2,name:"Amit Verma",class:"9th",email:"amit@gmail.com"},
    {id:3,name:"Priya Singh",class:"8th",email:"priya@gmail.com"},
  ]);

  return(
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>

        <button className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700">
          + Add Student
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Class</th>
              <th className="p-3">Email</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s)=>(
              <tr key={s.id} className="border-b border-gray-700">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.class}</td>
                <td className="p-3">{s.email}</td>
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

export default Students;
