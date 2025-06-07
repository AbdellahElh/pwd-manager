// src/pages/Login.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FaceRecognition from "../components/FaceRecognition";
import Webcam from "../components/Webcam";
import Error from "../components/ui/Error";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isEmailStep, setIsEmailStep] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.email) {
          setEmail(user.email);
          setIsEmailStep(false); // Skip to face recognition
        }
      } catch (e) {
        // Invalid JSON in localStorage, ignore and proceed with login
        localStorage.removeItem("user");
      }
    }
  }, []);

  // If authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailStep(false);
  };

  const handleAuthenticated = () => {
    // Save user to local storage for future logins
    localStorage.setItem("user", JSON.stringify({ email }));
    setIsAuthenticated(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const resetLogin = () => {
    setIsEmailStep(true);
    setEmail("");
    setError("");
  };
  if (isEmailStep) {
    return (
      <div className="max-w-md mt-12 mx-auto p-6 rounded-2xl bg-[var(--color-bg-primary)] shadow-[0_0_15px_var(--color-shadow-accent)] hover:shadow-[0_0_20px_var(--color-shadow-accent-hover)] transition-shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--color-text-accent)]">
          Login to Password Manager
        </h2>
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          {" "}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-[var(--color-border-secondary)] rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>{" "}
          {error && <Error message={error} onDismiss={() => setError("")} />}
          <div className="flex justify-between gap-4 pt-2">
            <button
              type="submit"
              className="group relative inline-flex items-center justify-center px-6 py-2.5 font-medium rounded-[14px] bg-[var(--color-bg-button)] text-white border border-[var(--color-border-accent)] shadow-[0_0_10px_1px_var(--color-shadow-button)] hover:shadow-[0_0_15px_3px_var(--color-shadow-button-hover)] transition-all duration-300 flex-1"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"></span>
              <span className="relative z-10 font-semibold tracking-wide">
                Continue
              </span>
            </button>
            <button
              type="button"
              onClick={goToRegister}
              className="px-6 py-2.5 rounded-[14px] bg-gray-50 text-gray-800 border border-gray-300 hover:bg-gray-100 transition-colors duration-300 flex-1 font-medium"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    );
  }
  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl bg-[var(--color-bg-primary)] shadow-[0_0_15px_var(--color-shadow-accent)] hover:shadow-[0_0_20px_var(--color-shadow-accent-hover)] transition-shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--color-text-accent)]">
        Face Recognition
      </h2>
      <div className="flex flex-col items-center space-y-5">
        <Webcam
          videoRef={videoRef}
          onStreamStart={() => setIsLoading(false)}
          onStreamError={handleError}
        />
        <FaceRecognition
          videoRef={videoRef}
          onAuthenticated={handleAuthenticated}
          onError={handleError}
          email={email}
        />
        <p className="text-[var(--color-text-secondary)] mt-1 text-center text-sm">
          Please position your face within the camera view to authenticate.
        </p>{" "}
        {error && <Error message={error} onDismiss={() => setError("")} />}{" "}
        <button
          onClick={resetLogin}
          className="mt-2 px-6 py-2.5 rounded-[14px] bg-gray-50 text-gray-800 border border-gray-300 hover:bg-gray-100 transition-colors duration-300 w-full font-medium"
        >
          Use Different Email
        </button>
      </div>
    </div>
  );
};

export default Login;
