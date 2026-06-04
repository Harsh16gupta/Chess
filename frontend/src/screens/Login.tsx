import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Update local storage session cache
      authLogin(user.email);
      localStorage.setItem("token", token);
      localStorage.setItem("rating", String(user.rating));

      setStatus("success");
      setTimeout(() => navigate("/home"), 800);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.response?.data?.error || e?.response?.data?.message || "Login failed. Try again.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { email, name, picture } = res.data;

        authLogin(email, { name, picture });
        localStorage.setItem("googleUser", JSON.stringify(res.data));
        navigate("/home");
      } catch (err) {
        console.error("Failed to fetch Google user", err);
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-stone-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, #a3e635 0%, transparent 50%)",
          }}
        />
        <span className="absolute text-[10rem] opacity-[0.03] top-[5%] left-[5%] rotate-[-10deg]">♜</span>
        <span className="absolute text-[12rem] opacity-[0.03] bottom-[5%] right-[5%] rotate-[15deg]">♞</span>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div
          className="text-center mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1 className="text-4xl font-black text-white tracking-tight">
            ♟ Chess<span className="text-lime-400">.in</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">Welcome back</p>
        </div>

        {/* Form card */}
        <div className="bg-stone-800/80 backdrop-blur-sm border border-stone-700/40 p-8 rounded-2xl shadow-2xl">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3.5 bg-stone-700/60 border border-stone-600/30 rounded-xl text-white placeholder-stone-400 outline-none focus:border-lime-500/50 transition-colors"
            placeholder="Username or Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full mb-5 p-3.5 bg-stone-700/60 border border-stone-600/30 rounded-xl text-white placeholder-stone-400 outline-none focus:border-lime-500/50 transition-colors"
            placeholder="Password"
          />
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className={`w-full bg-lime-600 hover:bg-lime-500 p-3.5 rounded-xl text-lg font-bold cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-lime-600/25 active:scale-[0.98] ${status === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {status === "loading" ? "Logging in..." : "Log In"}
          </button>

          {status === "success" && (
            <div className="mt-4 text-center text-emerald-400 font-semibold">
              ✓ Login successful! Redirecting...
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 text-center text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-stone-600/50" />
            <span className="text-stone-500 text-xs font-medium tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-stone-600/50" />
          </div>

          {/* Google */}
          <button
            onClick={() => googleLogin()}
            className="w-full bg-stone-700/60 hover:bg-stone-600/60 border border-stone-600/30 text-white p-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98]"
          >
            <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-stone-500 text-sm mt-6">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-lime-400 hover:text-lime-300 cursor-pointer font-semibold transition-colors"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
