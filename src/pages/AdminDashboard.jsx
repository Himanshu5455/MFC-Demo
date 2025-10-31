import React from "react";

const AdminDashboard = () => {

  return (
    <div className="min-h-screen p-6">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      
        <header className="flex items-center justify-between bg-blue-900 px-6 py-4">
          <h1 className="text-white text-xl font-bold">MFC Admin Dashboard</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
            LOGOUT
          </button>
        </header>

        <div className="flex border-b border-gray-200">
          <button className="px-6 py-3 font-semibold text-blue-900 border-b-2 border-blue-900">
            TRACK BOARD
          </button>
          <button className="px-6 py-3 font-semibold text-gray-500 hover:text-blue-900">
            ADMIN SETTINGS
          </button>
        </div>

        <div className="flex flex-wrap gap-3 px-6 py-4">
          <select className="border px-3 py-2 rounded-md">
            <option>Filter by client</option>
          </select>
          <select className="border px-3 py-2 rounded-md">
            <option>All Projects</option>
          </select>
          <select className="border px-3 py-2 rounded-md">
            <option>Filter by region</option>
          </select>
          <select className="border px-3 py-2 rounded-md">
            <option>All Status</option>
          </select>
          <button className="bg-green-500 text-white px-5 py-2 rounded-md hover:bg-green-600 transition">
            APPLY FILTERS
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 px-6 py-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">New</h3>
            <div className="space-y-3">
              <div className="bg-white border rounded-md shadow p-3">
                <p className="font-semibold">#016</p>
                <p>Project: XYZ</p>
                <p>Due: Sept 20, 2025</p>
              </div>
              <div className="bg-white border rounded-md shadow p-3">
                <p className="font-semibold">#017</p>
                <p>Project: ABC</p>
                <p>Due: Sept 21, 2025</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">In Progress</h3>
            <div className="space-y-3">
              <div className="bg-white border rounded-md shadow p-3">
                <p className="font-semibold">#018</p>
                <p>Project: DEF</p>
                <p>Due: Sept 22, 2025</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Waiting Forms</h3>
            <div className="space-y-3">
              <div className="bg-white border rounded-md shadow p-3">
                <p className="font-semibold">#019</p>
                <p>Project: GHI</p>
                <p>Due: Sept 23, 2025</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Ready for Schedule/Req</h3>
            <div className="space-y-3">
              <div className="bg-white border rounded-md shadow p-3">
                <p className="font-semibold">#020</p>
                <p>Project: JKL</p>
                <p>Due: Sept 24, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
