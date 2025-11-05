import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import axios from 'axios'; // Only needed if you want to fetch user info from Google

export default function SignUp() {
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
    flow: 'implicit', // or 'auth-code' depending on your setup
  });

  return (
    <div className="flex flex-col items-center h-screen w-screen bg-stone-800 text-white">
      {/* Header */}
      <div className="relative flex items-center w-full px-8 py-4">
        <div className="w-20" />
        <div className="absolute left-1/2 transform -translate-x-1/2 text-5xl font-bold cursor-pointer">
          Chess.in
        </div>
        <div className="text-xl p-4 rounded-lg cursor-pointer ml-auto">
          Log In
        </div>
      </div>

      {/* Title */}
      <div className="text-center mt-2">
        <h1 className="text-4xl font-bold">Create Your Chess.in</h1>
        <h1 className="text-4xl font-bold">Account</h1>
      </div>

      {/* Image */}
      <div className="mt-4">
        <img className="w-[350px]" src="/pawn-on-board.png" alt="pawn-on-board" />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-6 w-[350px]">
        <Button
          className="bg-lime-600 text-2xl font-bold py-4 rounded-xl w-full cursor-pointer"
          onClick={() => navigate('/signup/email')}
        >
          Continue with Email
        </Button>

        <Button
          className="bg-stone-900 text-white text-xl font-bold py-4 rounded-xl w-full cursor-pointer flex items-center justify-center gap-4"
          onClick={() => login()}
        >
          <div className='flex items-start justify-around'><img src="/google-icon.svg" alt="Google" className="h-6 w-6 " /></div>
          
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
