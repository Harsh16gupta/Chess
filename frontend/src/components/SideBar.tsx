import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./Button"

export const SideBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return(
        <div className="flex flex-col justify-between w-48 bg-black text-white py-4 border-r border-zinc-900 shrink-0">
            <div className="flex flex-col gap-1">
                <Button 
                    className="flex justify-center items-center font-bold text-2xl p-3 cursor-pointer hover:text-zinc-300 transition-colors duration-200" 
                    onClick={() => navigate("/")}>
                    <div>♟ Chess.in</div>
                </Button>
                
                <div className="px-2 mt-4 flex flex-col gap-1">
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/game") ? "bg-white text-black font-bold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        onClick={() => navigate("/game")}>
                        <div>▶ Play</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/puzzle") ? "bg-white text-black font-bold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        onClick={() => navigate("/puzzle")}>
                        <div>🧩 Puzzles</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/learn") ? "bg-white text-black font-bold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        onClick={() => navigate("/learn")}>
                        <div>📘 Learn</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white`}
                        onClick={() => navigate("/game")}>
                        <div>👁 Watch</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white`}
                        onClick={() => navigate("/game")}>
                        <div>⋯ More</div>
                    </Button>
                </div>
            </div>
            
            <div className="px-2 flex flex-col gap-2">
                <Button 
                    className="w-full flex justify-center items-center font-bold text-lg py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg cursor-pointer transition-colors duration-200" 
                    onClick={() => navigate("/signup")}>
                    <div>Sign Up</div>
                </Button>
                <Button 
                    className="w-full flex justify-center items-center font-bold text-lg py-2.5 bg-transparent border border-zinc-800 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors duration-200" 
                    onClick={() => navigate("/login")}>
                    <div>Log In</div>
                </Button>
            </div>
        </div>
    )
}