import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./Button"
import { useAuth } from "../context/AuthContext"

export const LoginSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-col justify-between w-48 bg-stone-900/80 text-white py-4 border-r border-stone-700/30 backdrop-blur-sm shrink-0">
            <div className="flex flex-col gap-1">
                <Button 
                    className="flex justify-center items-center font-bold text-2xl p-3 cursor-pointer hover:text-lime-400 transition-colors duration-200" 
                    onClick={() => navigate("/home")}>
                    ♟ Chess.in
                </Button>

                <div className="px-2 mt-4 flex flex-col gap-0.5">
                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/game") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/game")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8zM6 15h2v-2h2v-2H8V9H6v2H4v2h2z"/>
                            <circle cx="14.5" cy="12.5" r="1.5"/>
                            <circle cx="18.5" cy="12.5" r="1.5"/>
                        </svg>
                        Play
                    </Button>

                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/puzzles") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/puzzles")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 7h-7V2H9v5H2v15h20V7zM11 4h2v5h-2V4zm0 12H9v2H7v-2H5v-2h2v-2h2v2h2v2zm2-1.5V13h6v1.5h-6zm0 3V16h4v1.5h-4z"/>
                        </svg>
                        Puzzles
                    </Button>

                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/learn") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/learn")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3L1 9l11 6 9-5v6h2V9l-11-6zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                        </svg>
                        Learn
                    </Button>

                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 ${isActive("/watch") ? "bg-lime-600/20 text-lime-400" : "hover:bg-stone-700/60"}`}
                        onClick={() => navigate("/watch")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"/>
                        </svg>
                        Watch
                    </Button>

                    <Button 
                        className={`w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 hover:bg-stone-700/60`}
                        onClick={() => navigate("/more")}>
                        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="19" cy="12" r="2"/>
                        </svg>
                        More
                    </Button>
                </div>
            </div>
            
            <div className="px-2">
                <Button 
                    className="w-full flex justify-start items-center gap-3 font-semibold text-lg p-2.5 pl-4 cursor-pointer rounded-lg transition-all duration-200 text-red-400 hover:bg-red-500/10" 
                    onClick={() => {
                        logout();
                        navigate("/");
                    }}>
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Log out
                </Button>
            </div>
        </div>
    )
}