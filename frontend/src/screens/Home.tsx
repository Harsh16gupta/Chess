import { useNavigate } from "react-router-dom";
import { LoginSidebar } from "../components/LoginSidebar";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex w-full min-h-screen bg-[url('/homeback.jpg')] bg-cover bg-center bg-no-repeat text-white">
      {/* Sidebar */}
      <LoginSidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto px-30">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {user?.picture && (
              <img
                src={user.picture}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white"
              />
            )}
            <div>
              <div className="text-xl font-semibold">{user?.name || "Guest"}</div>
              <div className="text-sm text-gray-300">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Feature Panels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="grid grid-rows-5 gap-2 font-semibold ">
            <div>
              <h3 className="text-2xl font-bold cursor-pointer ">🔍 Play</h3>
            </div>

            <div className="flex bg-stone-900/90 rounded-xl shadow-lg items-center">
              <Button onClick={() => navigate("/game")} className="w-full py-4 rounded-md cursor-pointer">
                Play 10 min
              </Button>
            </div>
            <div className="flex bg-stone-900/90 rounded-xl shadow-lg ">
              <Button onClick={() => navigate("/game")} className="w-full py-4 rounded-md cursor-pointer">
                New Game
              </Button>
            </div>
            <div className="flex bg-stone-900/90 rounded-xl shadow-lg ">
              <Button onClick={() => navigate("/bot")} className="w-full py-4 rounded-md cursor-pointer">
                Play Bots
              </Button>
            </div>
            <div className="flex bg-stone-900/90 rounded-xl shadow-lg">
              <Button onClick={() => navigate("/game")} className="w-full py-4 rounded-md cursor-pointer">
                Play a Friend
              </Button>
            </div>
          </div>

          {/* Puzzles */}
          <div className="cursor-pointer ">
            <h3 className="text-2xl font-bold mb-4">🧩 Puzzles</h3>
            <div className="bg-stone-900/90 rounded-xl shadow-lg">
              <img src="/image1.png" alt="Puzzle" className="rounded" />
              <Button onClick={() => navigate("/puzzle")} className="w-full py-2 rounded-md cursor-pointer">
                Solve Puzzle
              </Button>
            </div>
          </div>

          {/* Lessons */}
          <div className="cursor-pointer ">
            <h3 className="text-2xl font-bold mb-4">📘 Next Lesson</h3>
            <div className="bg-stone-900/90 rounded-xl shadow-lg ">
              <img src="/image1.png" alt="Lesson" className="rounded" />
              <Button onClick={() => navigate("/lesson")} className="w-full py-2 rounded-md cursor-pointer">
                Start Lesson
              </Button>
            </div>
          </div>

          {/* Game Review */}
          <div className="cursor-pointer ">
            <h3 className="text-2xl font-bold mb-4">🔍 Game Review</h3>
            <div className="bg-stone-900/90 rounded-xl shadow-lg ">
              <img src="/image1.png" alt="Review" className="rounded" />
              <Button onClick={() => navigate("/review")} className="w-full py-2 rounded-md cursor-pointer">
                Review Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
