import React, { useEffect, useState } from "react";
import { User, Lock, Users, LogOut } from "lucide-react";
import ChangePassword from "./ChangePassword";
import UserManagement from "./UserManagement";
import PersonalInfoCard from "./PersonalInfoCard";
import { getMe, updateName } from "../services/api";
import { uploadAvatar } from "../services/api";
import { Camera } from "lucide-react";
import { logout } from "../services/api";
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState({
    avatar: "",
    firstName: "",
    lastName: "",
    role: "",
    email: "",
  });
  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMe();
        const mapped = {
          avatar: data?.image || "",
          firstName: data?.first_name || "",
          lastName: data?.last_name || "",
          role: data?.role || "",
          email: data?.email || data?.username || "",
        };
        if (isMounted) {
          setUser(mapped);
          setForm({ firstName: mapped.firstName, lastName: mapped.lastName });
        }
      } catch (e) {
        if (isMounted) setError(e?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateName({ firstName: form.firstName, lastName: form.lastName });
      setUser({ ...user, ...form });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ firstName: user.firstName, lastName: user.lastName });
  };
  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: previewUrl }));

    try {
      setUploading(true);
      const result = await uploadAvatar(file);
      if (result?.image) {
        setUser((prev) => ({ ...prev, avatar: result.image }));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-[1140px] mx-auto">
      <h2 className="text-2xl font-semibold p-4">Settings</h2>
      <button className="text-xl font-semibold p-4" onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 border border-gray-200 rounded-lg">
          <div className="bg-white rounded-lg shadow p-6">

            <div className="relative flex flex-col items-center mb-6">
              <span className="absolute right-0 -top-[6px] bg-red-100 text-red-500 text-xs px-2 py-0.5 rounded">
                {user.role}
              </span>

              <div className="relative w-24 h-24 mb-3">
                <img
                  src={user.avatar || "https://placehold.co/96x96?text=User"}
                  alt="avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />

                {/* Camera icon overlay */}
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow cursor-pointer hover:bg-gray-100"
                >
                  <Camera size={16} className="text-gray-600" />
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="font-semibold">{user.firstName + " " + user.lastName}</div>
              <div className="text-sm text-gray-500 mt-1">{user.role}</div>
              {uploading && <div className="text-xs text-gray-400 mt-1">Uploading...</div>}
            </div>

            {/* Menu */}
            <ul className="mt-2 space-y-1">
              <li
                onClick={() => setActiveTab("account")}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${activeTab === "account"
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <User size={18} /> <span>My account</span>
              </li>
              <li
                onClick={() => setActiveTab("password")}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${activeTab === "password"
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Lock size={18} /> <span>Change password</span>
              </li>
              <li
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${activeTab === "users"
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Users size={18} /> <span>User management</span>
              </li>
              <li
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} /> <span>Log out</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          {loading && <div className="mb-3 text-sm text-gray-500">Loading profile...</div>}
          {/* {error && <div className="mb-3 text-sm text-red-600">{error}</div>} */}
          {error && alert(`Error: ${error}`)}
          {activeTab === "account" && (


            <PersonalInfoCard
              user={user}
              form={form}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />

          )}

          {activeTab === "password" && <ChangePassword />}

          {activeTab === "users" && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

