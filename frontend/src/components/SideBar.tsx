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
                    className="flex justify-center items-center gap-2 font-bold text-2xl p-3 cursor-pointer hover:text-zinc-300 transition-colors duration-200" 
                    onClick={() => navigate("/")}>
                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3c0 .87.37 1.66 1 2.21A6.74 6.74 0 0 0 7 13.5c0 1 .5 1.5 1.5 1.5h7c1 0 1.5-.5 1.5-1.5a6.74 6.74 0 0 0-3-6.29c.63-.55 1-1.34 1-2.21a3 3 0 0 0-3-3z"/>
                        <path d="M8 19h8"/>
                        <path d="M6 22h12"/>
                    </svg>
                    Chess.in
                </Button>
                
                <div className="px-2 mt-4 flex flex-col gap-1">
                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/game") ? "bg-white text-black font-bold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        onClick={() => navigate("/game")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8zM6 15h2v-2h2v-2H8V9H6v2H4v2h2z"/>
                            <circle cx="14.5" cy="12.5" r="1.5"/>
                            <circle cx="18.5" cy="12.5" r="1.5"/>
                        </svg>
                        Play
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/puzzle") ? "bg-white text-black font-bold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        onClick={() => navigate("/puzzle")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 7h-7V2H9v5H2v15h20V7zM11 4h2v5h-2V4zm0 12H9v2H7v-2H5v-2h2v-2h2v2h2v2zm2-1.5V13h6v1.5h-6zm0 3V16h4v1.5h-4z"/>
                        </svg>
                        Puzzles
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/learn") ? "bg-white text-black font-bold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                        onClick={() => navigate("/learn")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3L1 9l11 6 9-5v6h2V9l-11-6zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                        </svg>
                        Learn
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white`}
                        onClick={() => navigate("/game")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"/>
                        </svg>
                        Watch
                    </Button>
                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 text-zinc-400 hover:bg-zinc-900 hover:text-white`}
                        onClick={() => navigate("/game")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="19" cy="12" r="2"/>
                        </svg>
                        More
                    </Button>
                </div>
            </div>
            
            <div className="px-2 flex flex-col gap-2">
                <Button 
                    className="w-full flex justify-center items-center font-bold text-lg py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg cursor-pointer transition-colors duration-200" 
                    onClick={() => navigate("/signup")}>
                    Sign Up
                </Button>
                <Button 
                    className="w-full flex justify-center items-center font-bold text-lg py-2.5 bg-transparent border border-zinc-800 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors duration-200" 
                    onClick={() => navigate("/login")}>
                    Log In
                </Button>
            </div>
        </div>
    )
}