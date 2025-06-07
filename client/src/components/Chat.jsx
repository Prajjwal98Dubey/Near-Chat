import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const ws = io("ws://localhost:5002");
const Chat = ({ roomId, userId }) => {
  const [inpText, setInpText] = useState("");
  const socketRef = useRef(ws);
  const [chats, setChats] = useState([]);
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
    }
  }, [chats]);
  const handleSendMessage = () => {
    socketRef.current.emit("user-message", { roomId, message: inpText });
    setChats([...chats, { message: inpText, isSender: true }]);
    setInpText("");
  };
  return (
    <>
      <div className="w-full h-[550px] px-4 py-2 flex justify-center">
        <div className=" w-[70%] h-[96%] relative">
          <div className="w-full h-[80%] border border-gray-300 rounded-md overflow-y-scroll">
            {chats.length &&
              chats.map((chat, index) => {
                return chat.isSender ? (
                  <div key={index} className="flex justify-end px-2 mt-1 mb-1">
                    <div className="w-fit h-[45px] rounded-md px-1 py-1 bg-green-500 border border-green-500 font-bold">
                      {chat.message}
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="flex justify-start px-2 mt-1 mb-1"
                  >
                    <div className="w-fit h-[45px] rounded-md px-1 py-1 bg-yellow-500 border border-yellow-500 font-bold">
                      {chat.message}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="absolute bottom-0 w-full h-[20%] px-10 flex">
            <input
              type="text"
              autoFocus
              value={inpText}
              onChange={(e) => setInpText(e.target.value)}
              className="w-full h-[45px] rounded-md px-2 py-1 border border-gray-400"
            />
            <div>
              <button
                onClick={handleSendMessage}
                className="w-[100px] h-[45px] bg-blue-500 font-bold text-white rounded-md"
              >
                send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
