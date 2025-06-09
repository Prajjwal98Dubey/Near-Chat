import React, { useEffect, useRef, useState } from "react";

const topics = ["Interests 🚀", "Secrets 🤐", "Dark Secrets 🤫", "Darker Secrets 😱","embrassing moments 🙈"];

const Header = () => {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(null);
  useEffect(() => {
    indexRef.current = setInterval(() => {
      let randIndex = Math.floor(Math.random() * topics.length);
      setIndex(randIndex);
    }, 2000);
    return () => {
      clearInterval(indexRef.current);
    };
  }, []);

  return (
    <div className="flex justify-center items-center py-4">
      <div>
        <div className="font-extrabold lg:text-5xl text-4xl flex justify-center items-center py-2">
          Near Chat
        </div>

        <div className="font-extrabold lg:text-4xl text-xl py-2 flex justify-center items-center">
          Chat with "People" anonmously about their
        </div>
        <div className="font-extrabold lg:text-3xl text-3xl py-2 flex justify-center items-center transition duration-300">
          {topics[index]}
        </div>
      </div>
    </div>
  );
};

export default Header;
