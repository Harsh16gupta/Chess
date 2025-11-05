import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useState } from "react";
import axios from 'axios';


export default function Email() {
    const navigate = useNavigate();
    const [email1 , setEmail1] = useState("");
    const [Password , setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ Added state

    const onclick = async () => {
        console.log("Logging in with:", email1, Password);
        try {
            const res = await axios.post('http://localhost:3000/api/auth/signup', { 
                email: email1,
                password: Password, 
            });

            const { token, user } = res.data;
            const { email, rating } = user;

            localStorage.setItem("token", token);
            localStorage.setItem("email", email);
            localStorage.setItem("rating", rating);

            setIsLoggedIn(true); // ✅ Show success message
            console.log(res.data);
            console.log(email);
            console.log(rating);

            setTimeout(() => {
                navigate("/home");
            }, 1000); // ✅ Optional delay to show message

        } catch(e) {
            console.log("error signing in");
        }
    };

    return (
        <div className="flex flex-col items-center h-screen w-screen bg-stone-800 text-white">
            {/* Header */}
            <div className="relative flex items-center w-full px-8 py-4">
                <div className="w-20"></div>

                <div className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer text-5xl font-bold text-white px-6 py-2 rounded-lg">
                    Chess.in
                </div>

                <div className="text-xl p-4  rounded-lg cursor-pointer ml-auto">
                </div>
            </div>

            {/* Title */}
            <div className="text-center mt-8 tracking-wide pb-7">
                <h1 className="text-4xl font-bold ">Enter Your Email and a</h1>
                <h1 className="text-4xl font-bold">Password</h1>
            </div>

            <div>
                <Input
                    src="/mail-svgrepo-com.svg"
                    type="email"
                    className="border border-gray-500 bg-stone-700 p-2 rounded w-[400px] py-3"
                    placeholder="Email"
                    value={email1}
                    onChange={(e) => setEmail1(e.target.value)}
                />
            </div>
            
            <div className="py-2">
                <Input
                    src="/password-svgrepo-com.svg"
                    type="password"
                    className="border border-gray-500 bg-stone-700 p-2 rounded w-[400px] py-3"
                    placeholder="Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-6 w-[400px] py-5">
                <Button
                    className="bg-lime-600 text-xl font-bold py-4 rounded-xl w-full cursor-pointer"
                    onClick={onclick}
                >
                    Continue
                </Button>

                {/* ✅ Success Message */}
                {isLoggedIn && (
                    <div className="text-green-400 text-lg font-medium text-center">
                        Login successful!
                    </div>
                )}
            </div>
        </div>
    );
}
