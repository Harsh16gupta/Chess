import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const googleSignUp = useGoogleLogin({
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
      console.error("Google sign up failed");
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
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-zinc-500 text-xs mt-1.5 font-medium">Join chess battles globally in seconds</p>
        </div>

        {/* Buttons card */}
        <div className="bg-zinc-900/10 border border-zinc-900 p-8 rounded-3xl shadow-2xl flex flex-col gap-4">
          <button
            onClick={() => navigate('/signup/email')}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-950 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 text-center"
          >
            ✉ Continue with Email
          </button>

          <button
            onClick={() => googleSignUp()}
            className="w-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-white py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-colors duration-200"
          >
            <img src="/google-icon.svg" alt="Google" className="h-4 w-4" />
            Continue with Google
          </button>
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
