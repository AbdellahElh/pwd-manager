// src/pages/Home.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordManager from "./PwdManager";

const Home: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!user) return null; // or a spinner

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <PasswordManager />
      </div>
    </div>
  );
};

export default Home;
