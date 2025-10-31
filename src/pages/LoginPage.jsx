 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { Snackbar, Alert } from "@mui/material";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const password = formData.password;

    if (!username || !password) {
      setToast({
        open: true,
        message: "Username and password are required",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(
        {
          username,
          password,
        },
        true
      );

      if (result?.access_token) {
        localStorage.setItem("token", result.access_token);
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setToast({
        open: true,
        message: err.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToastClose = (_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[600px]">
        <h1 className="text-center text-[35px] font-bold mb-4">MFC Admin Dashboard</h1>

        <div className="bg-white shadow-xl rounded-xl p-8">
          <h2 className="mb-4 text-[25px] font-bold">Staff Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full py-3 px-4 border rounded-md focus:ring-2 focus:ring-blue-400"
              autoFocus
              autoComplete="username"
              inputMode="text"
              aria-label="Username"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full py-3 px-4 border rounded-md focus:ring-2 focus:ring-blue-400 pr-12"
                autoComplete="current-password"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-blue-900 hover:text-blue-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 font-semibold rounded-md hover:bg-blue-700 transition"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
          <Snackbar
            open={toast.open}
            autoHideDuration={3000}
            onClose={handleToastClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert
              onClose={handleToastClose}
              severity={toast.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;