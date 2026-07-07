import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

import apiClient from "../../services/apiClient";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email || !otp) {
    navigate("/forgot-password");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain uppercase, lowercase, number, special character and minimum 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        "/auth/reset-password",
        {
          email,
          otp,
          password,
        }
      );

      if (response.data.success) {
        alert(
          "Password changed successfully. Please login."
        );

        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-dark-950 px-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8"
      >
        <div className="text-center mb-8">

          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-400 mb-4">
            <CheckCircle size={26} />
          </div>

          <h2 className="text-2xl font-bold text-white">
            Reset Password
          </h2>

          <p className="text-slate-400 mt-2">
            Choose a strong password.
          </p>

        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* New Password */}

          <div>

            <label className="text-xs uppercase font-semibold text-slate-400">
              New Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-4 top-4 text-slate-500"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-12 text-white outline-none focus:border-brand-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-4 text-slate-500"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Confirm Password */}

          <div>

            <label className="text-xs uppercase font-semibold text-slate-400">
              Confirm Password
            </label>

            <div className="relative mt-2">

              <Lock
                size={18}
                className="absolute left-4 top-4 text-slate-500"
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-12 text-white outline-none focus:border-brand-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-4 top-4 text-slate-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 rounded-xl py-3 font-bold text-dark-950"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </form>

        <div className="text-center mt-6">

          <Link
            to="/login"
            className="inline-flex items-center text-brand-400 hover:underline"
          >
            <ArrowLeft
              size={16}
              className="mr-2"
            />
            Back to Login
          </Link>

        </div>

      </motion.div>

    </div>
  );
};