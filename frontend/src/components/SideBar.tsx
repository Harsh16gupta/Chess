import { useNavigate } from "react-router-dom"
import { Button } from "./Button"

export const SideBar = () => {
    const navigate = useNavigate(); 
    return(
        <div className="flex flex-col justify-start w-40 bg-stone-900 text-white">
            <Button 
                className={"w-40 flex justify-center items-center font-bold text-3xl p-2 pt-2 cursor-pointer"} 
                onClick={() => {
                    navigate("/game")
                }}><div>Chess.in</div>
            </Button>
            <Button 
                className={"w-40 flex justify-start items-center font-bold text-xl p-2 pt-2 cursor-pointer ml-5"} 
                onClick={() => {
                    navigate("/game")
                }}><div>Play</div>
            </Button>
            <Button 
                className={"w-40 flex justify-start items-center font-bold text-xl p-2 pt-2 cursor-pointer ml-5"} 
                onClick={() => {
                    navigate("/puzzle")
                }}><div>Puzzles</div>
            </Button>
            <Button 
                className={"w-40 flex justify-start items-center font-bold text-xl p-2 pt-2 cursor-pointer ml-5"} 
                onClick={() => {
                    navigate("/learn")
                }}><div>Learn</div>
            </Button>
            <Button 
                className={"w-40 flex justify-start items-center font-bold text-xl p-2 pt-2 cursor-pointer ml-5"} 
                onClick={() => {
                    navigate("/game")
                }}><div>Watch</div>
            </Button>
            <Button 
                className={"w-40 flex justify-start items-center font-bold text-xl p-2 pt-2 cursor-pointer ml-5"} 
                onClick={() => {
                    navigate("/game")
                }}><div>More</div>
            </Button>
            <div className="m-2">
                <Button 
                    className={"w-35 flex justify-center items-center font-bold text-xl p-2 pt-2 bg-lime-600 rounded cursor-pointer"} 
                    onClick={() => {
                        navigate("/signup")
                    }}><div>Sign Up</div>
                </Button>
            </div>
            <div>
                 <Button 
                    className={"w-35 flex justify-center items-center font-bold text-xl p-2 pt-2 bg-stone-600 m-2 rounded cursor-pointer"} 
                    onClick={() => {
                        navigate("/login")
                    }}><div>Login</div>
                </Button>   
            </div>
            
            
        </div>
    )
}