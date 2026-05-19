import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Email() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;
    setStatus("loading");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await axios.post(`${apiUrl}/api/auth/signup`, {
        email,
        password,
      });

      const { token, user } = res.data;

      login(user.email, { name: user.name, picture: user.picture });
      localStorage.setItem("token", token);
      localStorage.setItem("rating", user.rating);

      setStatus("success");
      setTimeout(() => navigate("/home"), 800);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.response?.data?.message || "Sign up failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-950 text-white font-sans antialiased">
      <div className="relative w-full max-w-sm mx-4">
        
        {/* Logo */}
        <div
          className="text-center mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            ♟ chess.in
          </h1>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-zinc-500 text-xs mt-1.5 font-medium">Enter your credentials below</p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/10 border border-zinc-900 p-8 rounded-3xl shadow-2xl flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm outline-none focus:border-zinc-700 transition-colors"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm outline-none focus:border-zinc-700 transition-colors"
          />

          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-950 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 text-center"
          >
            {status === "loading" ? "Creating account..." : "Continue"}
          </button>

          {/* Status messages */}
          {status === "success" && (
            <div className="text-center text-zinc-300 text-xs font-semibold mt-2">
              ✓ Account created! Redirecting...
            </div>
          )}
          {status === "error" && (
            <div className="text-center text-red-400 text-xs font-medium mt-2">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-xs mt-6 font-medium">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-white hover:underline cursor-pointer font-semibold transition-colors"
          >
            Log In
          </span>
        </p>
      </div>
    </div>
  );
}
