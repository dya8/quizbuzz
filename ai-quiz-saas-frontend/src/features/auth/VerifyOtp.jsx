import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "../../services/apiClient";

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(60);

  const inputs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, []);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const copy = [...otp];
    copy[index] = value;
    setOtp(copy);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("Text")
      .trim();

    if (!/^\d{6}$/.test(pasted)) return;

    setOtp(pasted.split(""));
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    const code = otp.join("");

    try {
      const response = await apiClient.post(
        "/auth/verify-otp",
        {
          email,
          otp: code,
        }
      );

      if (response.data.success) {
        navigate("/reset-password", {
          state: {
            email,
            otp: code,
          },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await apiClient.post("/auth/forgot-password", {
        email,
      });

      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0].focus();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel max-w-md w-full rounded-3xl p-8"
      >

        <div className="text-center mb-8">

          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-400 mb-4">
            <ShieldCheck size={28} />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Verify OTP
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Enter the 6-digit OTP sent to
          </p>

          <p className="text-brand-400 font-semibold mt-1">
            {email}
          </p>

        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <div
          className="flex justify-between mb-8"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onKeyDown={(e) =>
                handleKeyDown(e, index)
              }
              onChange={(e) =>
                handleChange(
                  e.target.value,
                  index
                )
              }
              className="w-12 h-14 rounded-xl bg-slate-900 border border-slate-800 text-center text-white text-xl outline-none focus:border-brand-500"
            />
          ))}
        </div>

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 rounded-xl py-3 font-bold text-dark-950"
        >
          {loading
            ? "Verifying..."
            : "Verify OTP"}
        </button>

        <div className="mt-6 text-center">

          {timer > 0 ? (
            <p className="text-slate-400 text-sm">
              Resend OTP in {timer}s
            </p>
          ) : (
            <button
              onClick={resendOtp}
              className="text-brand-400 hover:underline"
            >
              Resend OTP
            </button>
          )}

        </div>

        <div className="mt-6 text-center">

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