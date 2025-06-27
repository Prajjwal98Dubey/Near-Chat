import { lazy, use } from "react";
import { OnlineContext } from "../contexts/OnlineContext.jsx";
import { Loader, Users, Wifi } from "lucide-react";
import { io } from "socket.io-client";
import { UserContext } from "../contexts/UserContext.jsx";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { WS_LOCAL_GLOBAL_CONNECTION } from "../apis/socket.api.jsx";

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
      const ws = io(WS_LOCAL_GLOBAL_CONNECTION);
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
  const Card = ({ className, children, ...props }) => (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Anonymous Chat
            </h1>
            <p className="text-gray-600">
              Connect with strangers from around the world
            </p>
          </div>
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-2xl p-8 w-full">
            <div className="flex justify-center items-center py-6 w-full">
              <div className="w-full max-w-md">
                {!onlineState.hideBtn && (
                  <div className="space-y-4">
                    {!onlineState.isOnline ? (
                      <div className="text-center animate-fade-in">
                        <div className="mb-6">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4">
                            <Wifi className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Go Online
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Connect to start chatting with strangers
                          </p>
                        </div>
                        <button
                          className="w-full bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-semibold rounded-2xl px-8 py-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-red-200"
                          onClick={handleAppearOnline}
                        >
                          Appear Online
                        </button>
                      </div>
                    ) : !onlineState.isFindUser ? (
                      <div className="text-center animate-fade-in">
                        <div className="mb-6">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Find a Chat Partner
                          </h3>
                          <p className="text-gray-600 text-sm">
                            We'll match you with someone random
                          </p>
                        </div>
                        <button
                          className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold rounded-2xl px-8 py-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-200"
                          onClick={handleFindUser}
                        >
                          Find User
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
                {onlineState.hideBtn && (
                  <div className="text-center w-full">
                    {onlineState.isLoading ? (
                      <div className="animate-fade-in">
                        <div className="mb-6">
                          <div className="flex justify-center mb-4 animate-spin">
                            <Loader />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Finding someone for you...
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Please wait while we connect you
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </Card>
          {onlineState.hideBtn && (
            <div className="text-center w-full">
              {!onlineState.isLoading && (
                <div className="w-full">
                  <Chat initialSocket={socket} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MainContainer;
