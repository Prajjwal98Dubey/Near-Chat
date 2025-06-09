import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import Chat from "./components/Chat";
import toast from "react-hot-toast";
import Header from "./components/Header";
import { Loader } from "lucide-react";
export default function App() {
  const [user, setUser] = useState("");
  const intervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBtn, setShowBtn] = useState(true);
  const [roomId, setRoomId] = useState("");
  useEffect(() => {
    let userId = nanoid();
    let es;
    const registerUser = async () => {
      let lat;
      let long;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        lat = pos.coords.latitude;
        long = pos.coords.longitude;
        es = new EventSource(
          `http://localhost:5000/api/v1/register?userId=${userId}&lat=${lat}&long=${long}`
        );
        es.onmessage = (e) => {
          if (e.data.split(",")[0] == "user-found") {
            setShowBtn(false);
            setRoomId(e.data.split(",")[1]);
          }
          if (e.data == "user-disconnect") {
            toast.error("user disconnected !!!");
            setShowBtn(true);
          }
        };
      });
      setUser(userId);
    };
    const handleDeRegisterUser = async () => {
      await fetch(`http://localhost:5000/api/v1/remove-user?userId=${userId}`, {
        method: "DELETE",
      });
    };
    registerUser();
    window.addEventListener(
      "beforeunload",
      async () => await handleDeRegisterUser()
    );
    return () => {
      window.removeEventListener(
        "beforeunload",
        async () => await handleDeRegisterUser()
      );
    };
  }, []);

  const handleFindUser = async () => {
    setIsLoading(true);
    setShowBtn(false);
    intervalRef.current = setInterval(() => {
      fetch(`http://localhost:5000/api/v1/short/find-user?userId=${user}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.isUserFound) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsLoading(false);
          }
        });
    }, [2000]);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-aladin text-gray-300">
      <Header />
      {user.length ? (
        <>
          {showBtn && (
            <div className="flex justify-center items-center p-2">
              <button
                onClick={handleFindUser}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-400 to-blue-500 hover:border hover:border-blue-800 transition duration-300 text-white font-bold font-savate"
              >
                Find User
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center p-2">
          <p className="text-center">Loading ...</p>
        </div>
      )}
      {!showBtn &&
        (isLoading ? (
          <div className="flex justify-center items-center py-2">
            <Loader
              className="animate-spin transition duration-200"
              color="#ffffff"
            />
          </div>
        ) : (
          <Chat roomId={roomId} userId={user} />
        ))}
    </div>
  );
}
