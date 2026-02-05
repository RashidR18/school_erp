import DashboardLayout from "../../layout/DashboardLayout";

function Fees(){
  return(
    <DashboardLayout>
      <h1 className="text-3xl font-bold">Fees Management</h1>
      <p className="text-gray-400 mt-2">Fees system coming soon...</p>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        
        <div className="bg-white/10 p-6 rounded-xl">
          <h2>Total Fees Collected</h2>
          <p className="text-2xl font-bold mt-2 text-green-400">₹2,40,000</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <h2>Pending Fees</h2>
          <p className="text-2xl font-bold mt-2 text-red-400">₹40,000</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <h2>This Month</h2>
          <p className="text-2xl font-bold mt-2 text-blue-400">₹80,000</p>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Fees;
