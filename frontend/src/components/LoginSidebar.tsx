import { useNavigate } from "react-router-dom"
import { Button } from "./Button"

export const LoginSidebar = () => {
    const navigate = useNavigate(); 
    return (
        <div className="flex flex-col justify-start w-40 bg-stone-800/70 text-white">
            <Button 
                className="w-40 flex justify-center items-center font-bold text-3xl p-4 cursor-pointer" 
                onClick={() => navigate("/home")}
            >
                Chess.in
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-2xl p-3 cursor-pointer ml-2" 
                onClick={() => navigate("/game")}
            >
                <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8zM6 15h2v-2h2v-2H8V9H6v2H4v2h2z"/>
                    <circle cx="14.5" cy="12.5" r="1.5"/>
                    <circle cx="18.5" cy="12.5" r="1.5"/>
                </svg>
                  Play
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-2xl p-3 cursor-pointer ml-2" 
                onClick={() => navigate("/puzzles")}
            >
                <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 7h-7V2H9v5H2v15h20V7zM11 4h2v5h-2V4zm0 12H9v2H7v-2H5v-2h2v-2h2v2h2v2zm2-1.5V13h6v1.5h-6zm0 3V16h4v1.5h-4z"/>
                </svg>
                Puzzles
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-2xl p-3 cursor-pointer ml-2" 
                onClick={() => navigate("/learn")}
            >
                <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6 9-5v6h2V9l-11-6zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
                Learn
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-2xl p-3 cursor-pointer ml-2" 
                onClick={() => navigate("/watch")}
            >
                <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"/>
                </svg>
                Watch
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-2xl p-3 cursor-pointer ml-2" 
                onClick={() => navigate("/more")}
            >
                <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="19" cy="12" r="2"/>
                </svg>
                More
            </Button>
            
            <Button 
                className="w-40 flex justify-start items-center font-bold text-2xl p-3 cursor-pointer " 
                onClick={() => {
                    localStorage.removeItem("googleUser");
                    navigate("/");
                }}
            >
                <svg className="w-7 h-7 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Log out
            </Button>
        </div>
    )
}