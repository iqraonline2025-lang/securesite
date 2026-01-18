"use client";
import React, { useState } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}

function LoginContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // We use the environment variable for the URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // This will show exactly what the backend is complaining about
        throw new Error(data.message || "Invalid Email or Password");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
          planTier: "Free" 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Google Identity Verification Failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />

      <Link href="/">
        <motion.button
          whileHover={{ x: -5 }}
          className="absolute top-10 left-10 z-50 flex items-center gap-3 px-5 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group"
        >
          <ArrowLeft size={16} className="text-zinc-500 group-hover:text-white" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white">Exit</span>
        </motion.button>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600/20">
            <Shield className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight italic uppercase">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 text-[10px] font-black uppercase tracking-widest">Secure access to your Shield AI</p>
        </div>

        <div className="w-full mb-6 overflow-hidden rounded-xl flex justify-center border border-white/5 p-1 bg-black/20">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign-In blocked by browser or config")}
            theme="filled_black"
            shape="pill"
            width="320"
          />
        </div>

        <div className="flex items-center gap-4 mb-8 text-zinc-800">
          <div className="h-[1px] w-full bg-zinc-800/50"></div>
          <span className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase">OR</span>
          <div className="h-[1px] w-full bg-zinc-800/50"></div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl mb-6 text-center animate-pulse">
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
              className="w-full bg-black/40 border border-zinc-800 p-4 pl-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full bg-black/40 border border-zinc-800 p-4 pl-12 pr-12 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700 text-sm"
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

          <button
            disabled={loading}
            className="w-full bg-blue-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest mt-2 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify Identity"}
          </button>
        </form>

        <p className="text-center mt-8 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          New operative?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline ml-1">
            Initialize Shield
          </Link>
        </p>
      </motion.div>
    </div>
  );
}