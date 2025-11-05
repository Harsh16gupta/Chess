import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { SideBar } from "../components/SideBar";

export default function Landing(){
    const navigate = useNavigate();
    return(
        <div className="flex ">
            
            <SideBar/>
            
                <div className="flex pt-10 justify-center h-screen w-screen bg-stone-800 text-white">
                    <div className="flex justify-center h-110">
                        <div className="basis-lg ">
                            <img className="" src="/board.png" alt="Board" />
                        </div>
                        <div className="basis-lg font-bold flex flex-col justify-center  pl-20 rounded-xl ">
                            <h1 className="flex justify-center text-5xl ">
                                Play Chess Online
                                on the #1 Site!
                            </h1>
                            <div className="flex pt-10 justify-center">
                                <Button className="w-sm bg-lime-600 h-20 rounded-xl cursor-pointer shadow-lime-900" onClick={() => {
                                    navigate("/game")
                                }}>
                                    <div className="text-2xl">Play Online</div>
                                    
                                    play with someone at your level
                                </Button> 
                            </div>
                        </div>
                    </div>
                    
                
                
            </div>
        </div>
    )

}