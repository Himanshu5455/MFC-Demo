
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { changePassword } from "../services/api";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (pwd) => {
    const numberRegex = /\d/;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return numberRegex.test(pwd) && symbolRegex.test(pwd);
  };

  const handleChangePassword = async () => {
    if (!validatePassword(password)) {
      setError("Password must include at least one number and one symbol");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await changePassword(password);
      alert("Password changed successfully!");
      console.log("API response:", res);

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
      <div className="space-y-4">
        
        {/* New Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            autoComplete="new-password"
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
          
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            autoComplete="new-password"
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} /> }
          </span>
          
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="bg-teal-700 text-white px-5 py-2 rounded hover:bg-teal-800 transition disabled:opacity-50"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;

