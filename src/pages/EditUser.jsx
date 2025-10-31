// EditUser.jsx
import React, { useEffect, useState } from "react";
import { updateUser } from "../services/api";

const EditUser = ({ isOpen, onClose, user, onUpdate }) => {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || user.name?.split(" ")[0] || "",
        last_name: user.last_name || user.name?.split(" ")[1] || "",
        role: user.role || "",
        username: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  if (!isOpen) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const updatedUser = await updateUser({
        id: user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        username: form.username,
        
        password: form.password || "",
      });

      onUpdate(updatedUser); 
      onClose(); 
    } catch (error) {
      alert(error.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-300/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="border p-2 rounded w-full"
          />
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="border p-2 rounded w-full"
          />
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Role"
            className="border p-2 rounded w-full"
          />
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Email Address"
            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
            disabled
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New Password"
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-[#125A67] text-white hover:bg-teal-800 transition">
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;

