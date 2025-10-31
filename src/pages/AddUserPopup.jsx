
import React, { useState } from "react";
import { addUser } from "../services/api"; 

const AddUserPopup = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName || !form.role || !form.email || !form.password) {
      alert("Please fill all fields!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // Call your backend API
      const newUser = await addUser({
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        email: form.email,
        password: form.password,
      });

      onAdd(newUser); 
      onClose(); 

      // Reset form           
      setForm({
        firstName: "",
        lastName: "",
        role: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };
 
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-300/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded bg-[#125A67] text-white hover:bg-teal-800 transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserPopup;
