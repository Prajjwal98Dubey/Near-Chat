/* eslint-disable no-undef */
import { use, useEffect, useRef, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { OnlineContext } from "../contexts/OnlineContext";
const Chat = ({ initialSocket }) => {
  const { state } = use(UserContext);
  const { dispatch } = use(OnlineContext);
  const [chats, setChats] = useState([]);
  const [inpText, setInpText] = useState("");
  const [chatSocket, setChatSocket] = useState("");
  const scrollRef = useRef(null);
  const handleSendChat = (e) => {
    e.preventDefault();
    if (inpText.length === 0)
      return toast.error("write something ...", {
        position: "top-center",
        duration: 1500,
      });
    chatSocket.emit("message-from-client", {
      message: inpText,
      roomId: state.roomId,
    });
    setChats((prev) => [
      ...prev,
      { message: inpText, time: Date.now(), isMe: true },
    ]);
    requestAnimationFrame(() => {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
    setInpText("");
  };
  const handleEndChat = () => {
    dispatch({ type: "USER_LEAVE" });
    initialSocket.emit("user-left", {
      roomId: state["roomId"],
      userId: state["userId"],
    });
  };
  useEffect(() => {
    if (!chatSocket) {
      setChatSocket(io("ws://localhost:5003"));
    }
  }, [chatSocket]);
  useEffect(() => {
    if (chatSocket) {
      chatSocket.emit("join-room", { roomId: state.roomId });
      chatSocket.on("message-from-server", ({ message }) => {
        setChats((prev) => [
          ...prev,
          { message, isMe: false, time: Date.now() },
        ]);
        requestAnimationFrame(() => {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        });
      });
    }
  }, [state.roomId, chatSocket]);

  return (
    <div className="fixed bottom-0 top-0 left-0 right-0 z-10 w-full min-h-screen font-inter">
      <div className="flex justify-center items-center py-3 "></div>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 animate-slideUp rounded-l-[36px] rounded-r-[36px]">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Anonymous Chat
            </h1>
            <p className="text-slate-300">
              Share your thoughts freely and safely
            </p>
          </div>
          <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Anonymous Room
                  </h2>
                  <p className="text-sm text-slate-400">
                    Your identity is protected
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400">Connected</span>
                  <button
                    type="button"
                    onClick={handleEndChat}
                    className="w-fit h-fit px-3 py-2 rounded-md bg-gradient-to-r border border-transparent hover:border hover:border-red-300 from-red-500 to-red-600 text-white font-bold mx-1"
                  >
                    End Chat
                  </button>
                </div>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="h-96 p-6 overflow-y-auto scroll-smooth bg-gradient-to-b from-slate-800/40 to-slate-900/60"
            >
              <div className="space-y-4">
                {chats.map((c) => {
                  return !c.isMe ? (
                    <div key={c.time} className="flex justify-start">
                      <div className="bg-slate-700/60 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 max-w-xs shadow-lg border border-slate-600/30">
                        <p className="text-slate-200">{c.message}</p>
                        <span className="text-xs text-slate-400 mt-1 block">
                          Anonymous • 2:34 PM
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={c.time} className="flex justify-end">
                      <div className="bg-purple-600/80 backdrop-blur-sm rounded-2xl rounded-br-md px-4 py-3 max-w-xs shadow-lg border border-purple-500/30">
                        <p className="text-white">{c.message}</p>
                        <span className="text-xs text-purple-200 mt-1 block">
                          You • 2:35 PM
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <form onSubmit={handleSendChat}>
              <div className="bg-slate-800/80 backdrop-blur-sm px-6 py-4 border-t border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={inpText}
                    onChange={(e) => setInpText(e.target.value)}
                    placeholder="Type your anonymous message..."
                    className="flex-1 bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-purple-500/25"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Messages are anonymous and encrypted
                </p>
              </div>
            </form>
          </div>
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Your privacy is our priority • No logs • No tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
