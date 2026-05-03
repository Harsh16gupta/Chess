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
            const res = await axios.post('http://localhost:3000/api/auth/signup', {
                email,
                password,
            });

            const { token, user } = res.data;

            login(user.email);
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
        <div className="min-h-screen w-screen flex items-center justify-center bg-stone-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none select-none">
                <div
                    className="absolute inset-0 opacity-15"
                    style={{
                        background: "radial-gradient(ellipse at 40% 40%, #4ade80 0%, transparent 50%), radial-gradient(ellipse at 60% 60%, #a3e635 0%, transparent 50%)",
                    }}
                />
            </div>

            {/* Form */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo */}
                <div
                    className="text-center mb-6 cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        ♟ Chess<span className="text-lime-400">.in</span>
                    </h1>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
                    <p className="text-stone-400 mt-1">Enter your email and a password</p>
                </div>

                {/* Form card */}
                <div className="bg-stone-800/80 backdrop-blur-sm border border-stone-700/40 p-8 rounded-2xl shadow-2xl">
                    <div className="relative mb-4">
                        <img
                            src="/mail-svgrepo-com.svg"
                            alt="Email"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 p-3.5 bg-stone-700/60 border border-stone-600/30 rounded-xl text-white placeholder-stone-400 outline-none focus:border-lime-500/50 transition-colors"
                        />
                    </div>

                    <div className="relative mb-6">
                        <img
                            src="/password-svgrepo-com.svg"
                            alt="Password"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            className="w-full pl-11 pr-4 p-3.5 bg-stone-700/60 border border-stone-600/30 rounded-xl text-white placeholder-stone-400 outline-none focus:border-lime-500/50 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={status === "loading"}
                        className={`w-full bg-lime-600 hover:bg-lime-500 p-3.5 rounded-xl text-lg font-bold cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-lime-600/25 active:scale-[0.98] ${status === "loading" ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {status === "loading" ? "Creating account..." : "Continue"}
                    </button>

                    {/* Status messages */}
                    {status === "success" && (
                        <div className="mt-4 text-center text-emerald-400 font-semibold">
                            ✓ Account created! Redirecting...
                        </div>
                    )}
                    {status === "error" && (
                        <div className="mt-4 text-center text-red-400 text-sm">
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-stone-500 text-sm mt-6">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-lime-400 hover:text-lime-300 cursor-pointer font-semibold transition-colors"
                    >
                        Log In
                    </span>
                </p>
            </div>
        </div>
    );
}
