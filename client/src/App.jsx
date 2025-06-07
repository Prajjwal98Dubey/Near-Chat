import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import Chat from "./components/Chat";
import toast from "react-hot-toast";
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
    <>
      <div className="text-[#313131] flex justify-center items-center py-4 font-bold text-5xl">
        Hi !!!
      </div>
      {user.length ? (
        <>
          {showBtn && (
            <div className="flex justify-center items-center p-2">
              <button
                onClick={handleFindUser}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold"
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
          <div>Finding Users ....</div>
        ) : (
          <Chat roomId={roomId} userId={user} />
        ))}
    </>
  );
}
