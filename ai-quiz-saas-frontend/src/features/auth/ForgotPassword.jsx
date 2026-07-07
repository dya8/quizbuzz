import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "../../services/apiClient";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/forgot-password", {
        email,
      });

      if (response.data.success) {
        navigate("/verify-otp", {
          state: { email },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-dark-950 px-4 relative overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-3xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">

          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 mb-4">
            <Sparkles size={24} />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Forgot Password
          </h1>

          <p className="text-slate-400 text-sm mt-2 text-center">
            Enter your registered email address.
            We'll send you a verification OTP.
          </p>

        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>

            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>

            <div className="relative">

              <Mail
                className="absolute left-4 top-3.5 text-slate-500"
                size={18}
              />

              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800 focus:border-brand-500 outline-none text-white"
              />

            </div>

          </div>

          <button
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 py-3 rounded-xl text-dark-950 font-bold transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        <div className="mt-6 text-center">

          <Link
            to="/login"
            className="inline-flex items-center text-brand-400 hover:underline text-sm"
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