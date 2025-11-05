import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { email, name, picture } = res.data;

        // Save user data
        localStorage.setItem("email", email);
        localStorage.setItem("name", name);
        localStorage.setItem("googleUser", JSON.stringify(res.data));
        console.log("Google user profile:", res.data);
        navigate("/home");
      } catch (err) {
        console.error("Failed to fetch Google user", err);
      }
    },
    onError: () => {
      console.log("Google login failed");
    },
    flow: 'implicit',
  });

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative bg-stone-700" style={{ perspective: '800px' }}>
      {/* Chessboard Background */}
      <header className="relative z-10 mb-6">
        <h1 className="text-5xl font-bold text-white">Chess.in</h1>
      </header>
      

      {/* Fade Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
        style={{ pointerEvents: 'none' }}
      ></div>

      {/* Login Box */}
      <div className="relative z-10 bg-stone-800 p-10 rounded-lg shadow-lg text-white w-[400px]">
        
        <input className="w-full mb-4 p-3 bg-stone-700 rounded" placeholder="Username, Phone, or Email" />
        <input type="password" className="w-full mb-4 p-3  bg-stone-700 rounded" placeholder="Password" />
        <button className="w-full my-4 bg-radial-[at_50%_75%] from-lime-500 via-lime-500 to-lime-600 to-90% hover:bg-green-700 p-3 rounded   text-xl font-bold cursor-pointer">Log In</button>
        <div className='my-8'>----------------------  OR -----------------------</div>
        {/* Google Button */}
        <button
          onClick={() => login()}
          className="w-full bg-stone-900 text-white hover:bg-black p-3 rounded font-bold flex items-center justify-center gap-3 cursor-pointer"
        >
          <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
          Login with Google
        </button>
      </div>
    </div>
  );
}
