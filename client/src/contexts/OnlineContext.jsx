import { createContext, useReducer } from "react";
import { statusReducer } from "../reducers/status.reducer";

const OnlineContext = createContext(false);

function OnlineContextProvider({ children }) {
  const [state, dispatch] = useReducer(statusReducer, {
    isOnline: false,
    isFindUser: false,
    isLoading: false, // will be true when the user start searching for user to chat.
    hideBtn: false,
  });
  return (
    <>
      <OnlineContext value={{ state, dispatch }}>{children}</OnlineContext>
    </>
  );
}

export { OnlineContext, OnlineContextProvider };
