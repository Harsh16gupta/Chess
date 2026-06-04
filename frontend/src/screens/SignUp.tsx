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
    <div className="min-h-screen w-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Grayscale background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, #27272a 0%, #000000 100%)",
          }}
        />
        <span className="absolute text-[10rem] opacity-[0.03] text-white top-[10%] right-[10%] rotate-[12deg]">♛</span>
        <span className="absolute text-[8rem] opacity-[0.03] text-white bottom-[10%] left-[10%] rotate-[-8deg]">♝</span>
      </div>

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div
          className="text-center mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1 className="text-4xl font-black text-white tracking-tight">
            ♟ Chess<span className="text-zinc-500">.in</span>
          </h1>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
          <p className="text-zinc-500 mt-2">Join the game in seconds</p>
        </div>

        {/* Pawn image (grayscale filter applied) */}
        <div className="flex justify-center mb-6">
          <img
            className="w-36 drop-shadow-lg filter grayscale"
            src="/pawn-on-board.png"
            alt="Chess piece"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/signup/email')}
            className="w-full bg-white hover:bg-zinc-200 text-black text-lg font-bold py-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          >
            ✉ Continue with Email
          </button>

          <button
            onClick={() => googleSignUp()}
            className="w-full bg-black hover:bg-zinc-900 border border-zinc-800 text-white text-lg font-bold py-4 rounded-lg cursor-pointer flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]"
          >
            <img src="/google-icon.svg" alt="Google" className="h-5 w-5 filter grayscale" />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-6">
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
