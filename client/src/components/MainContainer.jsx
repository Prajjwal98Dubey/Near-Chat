import { use } from "react";
import { OnlineContext } from "../contexts/OnlineContext.jsx";
import { Loader } from "lucide-react";
import { io } from "socket.io-client";
import { UserContext } from "../contexts/UserContext.jsx";
import { nanoid } from "nanoid";

const MainContainer = () => {
  const { state: onlineState, dispatch } = use(OnlineContext);
  const { state: userState, userDispatch } = use(UserContext);
  const handleAppearOnline = () => {
    dispatch({ type: "APPEAR_ONLINE" });
    navigator.geolocation.getCurrentPosition((pos) => {
      userDispatch({
        type: "SET_USER_COORDS",
        value: { lat: pos.coords.latitude, lon: pos.coords.longitude },
      });
    });
  };
  const handleFindUser = () => {
    dispatch({ type: "IS_FIND_USER" });
    const ws = io("ws://localhost:5001");
    ws.emit("register_user", {
      userId: nanoid(),
      lat: userState.lat,
      lon: userState.lon,
    });
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
            <div>Chat</div>
          ))}
      </div>
    </div>
  );
};

export default MainContainer;
