import { use, useEffect, useState } from "react";
import { OnlineContext } from "../contexts/OnlineContext";

const CHICKY_LINES = [
  "Interests ❤️",
  "Secrets 🙈",
  "Dark Secrets 🤫",
  "Darkest Secret 🤐",
];
const Navbar = () => {
  const [index, setIndex] = useState(0);
  const { state } = use(OnlineContext);
  useEffect(() => {
    setInterval(() => {
      let newIndex = Math.floor(Math.random() * CHICKY_LINES.length);
      setIndex(newIndex);
    }, 1500);
  }, []);

  return (
    <div className="flex justify-center">
      <div>
        <h1
          className={`text-3xl font-bold transition-all duration-300 ${
            state.isOnline ? "text-green-600" : "text-rose-600"
          } drop-shadow-[0_3px_3px_rgba(0,0,0,0.3)] py-2`}
        >
          Chat Anonymously...
        </h1>
        <div className="flex justify-center items-center">
          <h2
            className={`text-xl font-bold transition-all duration-300  ${
              state.isOnline ? "text-green-600" : "text-rose-600"
            }  drop-shadow-[0_3px_3px_rgba(0,0,0,0.3)] py-1`}
          >
            Share your{" "}
            <span className="w-[200px] transition-all duration-200">
              {CHICKY_LINES[index]}
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
