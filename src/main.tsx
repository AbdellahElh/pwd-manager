import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, useRoutes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

const AppRoutes = () =>
  useRoutes([
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        { path: "/login", element: <Login /> },
        { path: "/register", element: <Register /> },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ]);

const Root = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  </AuthProvider>
);

createRoot(document.getElementById("root")!).render(<Root />);
