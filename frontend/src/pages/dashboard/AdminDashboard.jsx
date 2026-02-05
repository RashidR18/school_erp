import DashboardLayout from "../../layout/DashboardLayout";

function AdminDashboard(){
  return(
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2>Total Students</h2>
          <p className="text-2xl font-bold">1200</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Total Teachers</h2>
          <p className="text-2xl font-bold">80</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Fees Collected</h2>
          <p className="text-2xl font-bold">₹2,40,000</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2>Pending Fees</h2>
          <p className="text-2xl font-bold">₹40,000</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard;
