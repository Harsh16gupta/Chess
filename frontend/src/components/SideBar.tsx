import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./Button"

export const SideBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return(
        <div className="flex flex-col justify-between w-48 bg-stone-900 text-white py-4 border-r border-stone-700/50 shrink-0">
            <div className="flex flex-col gap-1">
                <Button 
                    className="flex justify-center items-center font-bold text-2xl p-3 cursor-pointer hover:text-lime-400 transition-colors duration-200" 
                    onClick={() => navigate("/")}>
                    <div>♟ Chess.in</div>
                </Button>
                
                <div className="px-2 mt-4 flex flex-col gap-0.5">
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/game") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/game")}>
                        <div>▶ Play</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/puzzle") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/puzzle")}>
                        <div>🧩 Puzzles</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/learn") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/learn")}>
                        <div>📘 Learn</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 hover:bg-stone-700/60`}
                        onClick={() => navigate("/game")}>
                        <div>👁 Watch</div>
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 hover:bg-stone-700/60`}
                        onClick={() => navigate("/game")}>
                        <div>⋯ More</div>
                    </Button>
                </div>
            </div>
            
            <div className="px-2 flex flex-col gap-2">
                <Button 
                    className="w-full flex justify-center items-center font-bold text-lg py-2.5 bg-lime-600 hover:bg-lime-500 rounded-lg cursor-pointer transition-colors duration-200" 
                    onClick={() => navigate("/signup")}>
                    <div>Sign Up</div>
                </Button>
                <Button 
                    className="w-full flex justify-center items-center font-bold text-lg py-2.5 bg-stone-700 hover:bg-stone-600 rounded-lg cursor-pointer transition-colors duration-200" 
                    onClick={() => navigate("/login")}>
                    <div>Log In</div>
                </Button>
            </div>
        </div>
    )
}