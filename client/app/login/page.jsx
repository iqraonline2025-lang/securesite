"use client";
import React, { useState } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- MANUAL LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials");

      // Store user session
      localStorage.setItem("user", JSON.stringify(data.user));

      // REDIRECT LOGIC: Check if backend requires payment or dashboard
      if (data.redirectTo === "payment") {
        window.location.href = "/signup"; // Redirect to signup/payment step
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE LOGIN HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
          planTier: "Free" // Default tier if they are a first-time user via Login page
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Google Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));

      // REDIRECT LOGIC: Check if user needs to pay
      if (data.redirectTo === "payment") {
        window.location.href = "/signup"; 
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600/20">
            <Shield className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight italic">WELCOME BACK</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">Secure access to your Shield AI</p>
        </div>

        {/* Google Login Component */}
        <div className="w-full mb-6 overflow-hidden rounded-xl flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-In failed")}
            theme="filled_black"
            shape="pill"
            width="340"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8 text-zinc-800">
          <div className="h-[1px] w-full bg-zinc-800"></div>
          <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">OR</span>
          <div className="h-[1px] w-full bg-zinc-800"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full bg-black/40 border border-zinc-800 p-4 pl-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full bg-black/40 border border-zinc-800 p-4 pl-12 pr-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-blue-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right">
            <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-blue-500 transition-colors">
              Forgotten password?
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-2 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          New to the platform?{" "}
          <a href="/signup" className="text-blue-500 hover:underline ml-1">
            Initialize Shield
          </a>
        </p>
      </div>
    </div>
  );
}