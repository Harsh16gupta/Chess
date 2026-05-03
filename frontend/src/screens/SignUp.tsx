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
    <div className="min-h-screen w-screen flex items-center justify-center bg-stone-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: "radial-gradient(ellipse at 30% 30%, #4ade80 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, #a3e635 0%, transparent 50%)",
          }}
        />
        <span className="absolute text-[10rem] opacity-[0.03] top-[10%] right-[10%] rotate-[12deg]">♛</span>
        <span className="absolute text-[8rem] opacity-[0.03] bottom-[10%] left-[10%] rotate-[-8deg]">♝</span>
      </div>

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div
          className="text-center mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1 className="text-4xl font-black text-white tracking-tight">
            ♟ Chess<span className="text-lime-400">.in</span>
          </h1>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
          <p className="text-stone-400 mt-2">Join the game in seconds</p>
        </div>

        {/* Pawn image */}
        <div className="flex justify-center mb-6">
          <img
            className="w-36 drop-shadow-lg"
            src="/pawn-on-board.png"
            alt="Chess piece"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/signup/email')}
            className="w-full bg-lime-600 hover:bg-lime-500 text-white text-lg font-bold py-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-lime-600/25 active:scale-[0.98]"
          >
            ✉ Continue with Email
          </button>

          <button
            onClick={() => googleSignUp()}
            className="w-full bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/40 text-white text-lg font-bold py-4 rounded-xl cursor-pointer flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
          >
            <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>
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
