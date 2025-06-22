import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { OnlineContextProvider } from "./contexts/OnlineContext.jsx";
import { UserContextProvider } from "./contexts/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    <OnlineContextProvider>
      <App />
    </OnlineContextProvider>
  </UserContextProvider>
);
