import { useReducer } from "react";
import { createContext } from "react";
import { userReducer } from "../reducers/status.reducer.js";

const UserContext = createContext();

function UserContextProvider({ children }) {
  const [state, userDispatch] = useReducer(userReducer, {
    userId: "",
    roomId: "",
    lat: "",
    lon: "",
  });
  return (
    <>
      <UserContext value={{ state, userDispatch }}>{children}</UserContext>
    </>
  );
}

export { UserContext, UserContextProvider };
