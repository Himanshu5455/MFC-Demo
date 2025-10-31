import React, { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { getUsers, deleteUser } from "../services/api";
import AddUserPopup from "./AddUserPopup";
import EditUser from "./EditUser";
import Deactivate from "./Deactivate";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openUserId, setOpenUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeaModalOpen, setIsDeaModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3); // Show 3 rows initially

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = async (newUser) => {
    // setUsers((prev) => [newUser, ...prev]);
     try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  const goToNextPage = () =>
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleToggle = (userId) => {
    setOpenUserId(openUserId === userId ? null : userId);
  };

  const handleUpdateUser = async (updatedUserFromApi) => {
    const mapped = {
      id: updatedUserFromApi.id,
      name: `${updatedUserFromApi.first_name || ""} ${
        updatedUserFromApi.last_name || ""
      }`.trim(),
      email: updatedUserFromApi.username,
      role: updatedUserFromApi.role,
      status: updatedUserFromApi.status || "Active",
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === mapped.id ? { ...u, ...mapped } : u))
    );
  };

  const handleDeactivate = async (userId) => {
    setIsDeactivating(true);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error("Failed to deactivate user", e);
      alert("Failed to deactivate user. See console for details.");
    } finally {
      setIsDeactivating(false);
      setIsDeaModalOpen(false);
      setSelectedUser(null);
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col min-h-[300px]">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-5">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-64"
          />
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none">
            <option>Sort by</option>
            <option>Name</option>
            <option>Role</option>
            <option>Status</option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#125A67] text-white px-4 py-2 rounded-md hover:bg-teal-800 transition w-full md:w-auto"
        >
          + Add user
        </button>
      </div>

      {/* Table Container (fixed height area) */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-[#1010100D]">
              <tr className="text-left border-b border-gray-200 text-gray-600 text-sm">
                <th className="px-3 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Member */}
                  <td className="flex items-center gap-3 px-3 py-3">
                    <div className="bg-teal-100 text-[#125A67] w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-gray-500 text-sm">{user.email}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-3 py-3">
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-md">
                      {user.role || "Not set"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <span
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status || "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3 relative text-right">
                    <MoreVertical
                      size={18}
                      className="cursor-pointer text-gray-600 hover:text-gray-800 inline-block"
                      onClick={() => handleToggle(user.id)}
                    />
                    {openUserId === user.id && (
                      <div className="absolute right-6 top-8 mt-1 w-36 bg-white shadow-lg rounded-lg z-10 border border-gray-200">
                        <div className="flex flex-col gap-2 p-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeaModalOpen(true);
                              setOpenUserId(null);
                            }}
                            className="text-sm text-red-600 hover:underline text-left"
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                              setOpenUserId(null);
                            }}
                            className="text-sm text-gray-700 hover:underline text-left"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - fixed at bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center  text-sm text-gray-600 gap-3 p-4 bg-[#1010100D]">
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              {"<<"}
            </button>
            <button
              className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
            <button
              className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              {">>"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserPopup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
      <EditUser
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />
      <Deactivate
        isOpen={isDeaModalOpen}
        isLoading={isDeactivating}
        onClose={() => {
          if (isDeactivating) return;
          setIsDeaModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onConfirm={() => selectedUser && handleDeactivate(selectedUser.id)}
      />
    </div>
  );
};

export default UserManagement;

