import { useNavigate } from "react-router-dom"
import { Button } from "./Button"

export const LoginSidebar = () => {
    const navigate = useNavigate(); 
    return (
        <div className="flex flex-col justify-start w-40 bg-stone-800/50 text-white">
            <Button 
                className="w-40 flex justify-center items-center font-bold text-2xl p-4 cursor-pointer" 
                onClick={() => navigate("/home")}
            >
                ♟Chess.in
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-xl p-2 cursor-pointer" 
                onClick={() => navigate("/game")}
            >
                🕹 Play
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-xl p-2 cursor-pointer" 
                onClick={() => navigate("/puzzles")}
            >
                🧩 Puzzles
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-xl p-2 cursor-pointer" 
                onClick={() => navigate("/learn")}
            >
                🎓 Learn
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-xl p-2 cursor-pointer" 
                onClick={() => navigate("/watch")}
            >
                🔭 Watch
            </Button>

            <Button 
                className="w-40 flex justify-start items-center font-bold text-xl p-2 cursor-pointer " 
                onClick={() => navigate("/more")}
            >
                ⋯ More
            </Button>
            <Button 
                className="w-40 flex justify-start items-center font-bold text-xl p-2 cursor-pointer " 
                onClick={() => {localStorage.removeItem("googleUser");
                    navigate("/");}
                    }>
                Log out
            </Button>
        </div>
    )
}
