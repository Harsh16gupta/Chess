import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./Button";

export const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col justify-between w-52 bg-zinc-950 text-white py-6 border-r border-zinc-900 shrink-0 font-sans">
      <div className="flex flex-col gap-1">
        {/* Minimalist Logo */}
        <Button
          className="flex items-center gap-2 px-6 py-2 text-xl font-bold tracking-tight text-white hover:opacity-85 transition-opacity cursor-pointer justify-start"
          onClick={() => navigate("/")}
        >
          <span>♟</span> <span>chess.in</span>
        </Button>

        {/* Navigation Items */}
        <div className="px-3 mt-8 flex flex-col gap-1">
          <Button
            className={`w-full flex justify-start items-center gap-3 font-semibold text-sm py-2.5 px-4 cursor-pointer rounded-full transition-all duration-200 ${
              isActive("/game") ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-200"
            }`}
            onClick={() => navigate("/game")}
          >
            <span>▶</span> <span>Play</span>
          </Button>

          <Button
            className={`w-full flex justify-start items-center gap-3 font-semibold text-sm py-2.5 px-4 cursor-pointer rounded-full transition-all duration-200 ${
              isActive("/puzzle") ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-200"
            }`}
            onClick={() => navigate("/game")}
          >
            <span>🧩</span> <span>Puzzles</span>
          </Button>

          <Button
            className={`w-full flex justify-start items-center gap-3 font-semibold text-sm py-2.5 px-4 cursor-pointer rounded-full transition-all duration-200 ${
              isActive("/learn") ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-200"
            }`}
            onClick={() => navigate("/game")}
          >
            <span>📘</span> <span>Learn</span>
          </Button>

          <Button
            className="w-full flex justify-start items-center gap-3 font-semibold text-sm py-2.5 px-4 cursor-pointer rounded-full text-zinc-500 hover:text-zinc-200 transition-all duration-200"
            onClick={() => navigate("/game")}
          >
            <span>👁</span> <span>Watch</span>
          </Button>

          <Button
            className="w-full flex justify-start items-center gap-3 font-semibold text-sm py-2.5 px-4 cursor-pointer rounded-full text-zinc-500 hover:text-zinc-200 transition-all duration-200"
            onClick={() => navigate("/game")}
          >
            <span>⋯</span> <span>More</span>
          </Button>
        </div>
      </div>

      {/* Account actions */}
      <div className="px-4 flex flex-col gap-2">
        <Button
          className="w-full flex justify-center items-center font-semibold text-sm py-2.5 bg-white text-zinc-950 rounded-full cursor-pointer hover:bg-zinc-100 transition-colors duration-200"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
        <Button
          className="w-full flex justify-center items-center font-semibold text-sm py-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-full cursor-pointer hover:bg-zinc-800 transition-colors duration-200"
          onClick={() => navigate("/login")}
        >
          Log In
        </Button>
      </div>
    </div>
  );
};