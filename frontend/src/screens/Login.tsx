import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    setStatus("loading");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await axios.post(`${apiUrl}/api/auth/signin`, {
        email,
        password,
      });

      const { token, user } = res.data;
      authLogin(user.email, { name: user.name, picture: user.picture });
      localStorage.setItem("token", token);
      localStorage.setItem("rating", user.rating);
      navigate("/home");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.response?.data?.message || "Invalid credentials. Try again.");
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
          <p className="text-zinc-500 text-xs mt-1.5 font-medium">Log in to write your match history</p>
        </div>

        {/* Form Container */}
        <div className="bg-zinc-900/10 border border-zinc-900 p-8 rounded-3xl shadow-2xl flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm outline-none focus:border-zinc-700 transition-colors"
            placeholder="Email Address"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm outline-none focus:border-zinc-700 transition-colors"
            placeholder="Password"
          />

          {status === "error" && (
            <p className="text-red-400 text-xs font-medium text-center">{errorMsg}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={status === "loading"}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-950 py-3 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 text-center"
          >
            {status === "loading" ? "Logging in..." : "Log In"}
          </button>

          {/* Divider */}
          <div className="my-2 flex items-center gap-4">
            <div className="flex-1 h-px bg-zinc-900" />
            <span className="text-zinc-600 text-[10px] font-semibold tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          {/* Google Sign-in */}
          <button
            onClick={() => googleLogin()}
            className="w-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-white py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-colors duration-200"
          >
            <img src="/google-icon.svg" alt="Google" className="h-4 w-4" />
            Continue with Google
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-zinc-500 text-xs mt-6 font-medium">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-white hover:underline cursor-pointer font-semibold transition-colors"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
