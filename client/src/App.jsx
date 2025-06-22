import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";

const App = () => {
  return <RouterProvider router={appRouter} />;
};

export default App;

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);
