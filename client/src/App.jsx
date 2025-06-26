import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <RouterProvider router={appRouter} />
      <Toaster />
    </>
  );
};

export default App;

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);
