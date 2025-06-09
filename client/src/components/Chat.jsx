import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { formatMilisecondToDate } from "../helpers/formatTime";

const ws = io("ws://localhost:5002");
const Chat = ({ roomId, userId }) => {
  const [inpText, setInpText] = useState("");
  const socketRef = useRef(ws);
  const [chats, setChats] = useState([]);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit("roomInfo", { roomId });
    }
  }, [roomId]);
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("server-sent-chat", (payload) => {
        setChats([...chats, { message: payload.message, isSender: false }]);
      });
      requestAnimationFrame(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [chats]);
  const handleSendMessage = (e) => {
    e.preventDefault();
    socketRef.current.emit("user-message", { roomId, message: inpText });
    setChats([...chats, { message: inpText, isSender: true }]);
    setInpText("");
    requestAnimationFrame(() => {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  };
  return (
    <>
      {/* Web */}
      <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden mx-14 font-savate">
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
          </div>
        </div>
        <div
          ref={scrollRef}
          className="h-96 w-full p-6 overflow-y-auto scroll-smooth bg-gradient-to-b from-slate-800/40 to-slate-900/60"
        >
          <div className="space-y-4">
            {chats.map((chat, index) => {
              return chat.isSender ? (
                <div key={index} className="flex justify-end">
                  <div className="bg-purple-600/80 backdrop-blur-sm rounded-2xl rounded-br-md px-4 py-3 max-w-xs shadow-lg border border-purple-500/30">
                    <p className="text-white">{chat.message}</p>
                    <span className="text-xs text-purple-200 mt-1 block">
                      You • {formatMilisecondToDate(Date.now())}
                    </span>
                  </div>
                </div>
              ) : (
                <div key={index} className="flex justify-start">
                  <div className="bg-slate-700/60 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 max-w-xs shadow-lg border border-slate-600/30">
                    <p className="text-slate-200">{chat.message}</p>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Anonymous • {formatMilisecondToDate(Date.now())}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <form
          onSubmit={handleSendMessage}
          className="bg-slate-800/80 backdrop-blur-sm px-6 py-4 border-t border-slate-700/50"
        >
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Type your anonymous message..."
              value={inpText}
              onChange={(e) => setInpText(e.target.value)}
              className="flex-1 bg-slate-700/60 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-purple-500/25"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Messages are anonymous
          </p>
        </form>
      </div>
    </>
  );
};

export default Chat;
