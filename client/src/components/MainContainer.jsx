import { lazy, use } from "react";
import { OnlineContext } from "../contexts/OnlineContext.jsx";
import { Loader } from "lucide-react";
import { io } from "socket.io-client";
import { UserContext } from "../contexts/UserContext.jsx";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";

const Chat = lazy(() => import("./Chat.jsx"));

const MainContainer = () => {
  const { state: onlineState, dispatch } = use(OnlineContext);
  const { state: userState, userDispatch } = use(UserContext);
  const [socket, setSocket] = useState("");
  useEffect(() => {
    if (socket) {
      socket.on("user-found", ({ isFound, roomId }) => {
        if (isFound) {
          dispatch({ type: "USER_FOUND" });
          userDispatch({ type: "SET_USER_ROOM", value: roomId });
        }
      });
      socket.on("user-disconnect", () => {
        dispatch({ type: "USER_LEAVE" });
        toast.error("⚠️⚠️⚠️ user left ", {
          position: "top-center",
          duration: 1500,
        });
      });
    }
  }, [socket, dispatch, userDispatch]);
  const handleAppearOnline = () => {
    dispatch({ type: "APPEAR_ONLINE" });
    navigator.geolocation.getCurrentPosition((pos) => {
      userDispatch({
        type: "SET_USER_COORDS",
        value: { lat: pos.coords.latitude, lon: pos.coords.longitude },
      });
      const ws = io("ws://localhost:5001");
      let userId = nanoid();
      userDispatch({ type: "SET_USER_ID", value: userId });
      ws.emit("register_user", {
        userId,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
      setSocket(ws);
    });
  };
  const handleFindUser = () => {
    dispatch({ type: "IS_FIND_USER" });
    socket.emit("find-user", { userId: userState.userId });
  };

  return (
    <div className="flex justify-center items-center py-3">
      <div>
        {!onlineState.hideBtn &&
          (!onlineState.isOnline ? (
            <button
              className="bg-gradient-to-r from-red-400 to-red-600 border border-transparent hover:border-red-200 text-white font-bold rounded-[36px] px-5 py-2"
              onClick={handleAppearOnline}
            >
              Appear Online
            </button>
          ) : !onlineState.isFindUser ? (
            <button
              className="bg-gradient-to-r from-blue-400 to-blue-600 border border-transparent hover:border-blue-200 text-white font-bold rounded-[36px] px-5 py-2"
              onClick={handleFindUser}
            >
              Find User
            </button>
          ) : null)}
        {onlineState.hideBtn &&
          (onlineState.isLoading ? (
            <div className="w-fit h-fit animate-spin">
              <Loader />
            </div>
          ) : (
            <div>
              <Chat initialSocket={socket} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MainContainer;
