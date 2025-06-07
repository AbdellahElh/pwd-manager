// src/components/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "../components/Webcam";
import Error from "../components/ui/Error";
import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";
import { post } from "../data/apiClient";
import { createEncryptedImageFormData } from "../utils/imageEncryptionUtils";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCapture = (blob: Blob) => setSelfie(blob);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfie) {
      setError("Please capture a selfie.");
      return;
    }
    setIsLoading(true);

    try {
      // Create a temporary encryption key for registration
      // We use a combination of email and app secret to derive this key
      const tempEncryptionKey = `pwd-manager-temp-${email}-${
        import.meta.env.VITE_SECRET_KEY
      }`;

      // Create an encrypted form data with the selfie
      const formData = await createEncryptedImageFormData(
        selfie,
        tempEncryptionKey,
        "selfie",
        { email }
      );

      // Register the user with the encrypted selfie
      await post("/users/register", formData);

      // Login using the same selfie (also encrypted in the login function)
      await login(email, selfie);
      navigate("/");
    } catch (err: any) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-md mt-12 mx-auto p-6 mb-6 rounded-2xl bg-[var(--color-bg-primary)] shadow-[0_0_15px_var(--color-shadow-accent)] hover:shadow-[0_0_20px_var(--color-shadow-accent-hover)] transition-shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--color-text-accent)]">
        Register New Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--color-text-secondary)]">
            Face Recognition Photo
          </label>
          <p className="text-[var(--color-text-muted)] text-xs mb-2">
            Position your face within the camera view and click "Capture" to
            take a photo for authentication.
          </p>
          <div className="webcam-container -mx-6 -my-2">
            <Webcam onCapture={handleCapture} />
          </div>{" "}
          <p className="text-[var(--color-text-muted)] text-xs mt-2">
            This photo will be used to verify your identity when you login to
            your account.
          </p>
          {selfie && (
            <div className="mt-3 text-[var(--color-text-accent)] bg-[var(--color-bg-success)] p-2 rounded-lg text-sm text-center">
              ✓ Photo captured successfully! You can now create your account.
            </div>
          )}
        </div>{" "}
        {error && <Error message={error} onDismiss={() => setError("")} />}
        <div className="pt-2">
          {" "}
          <button
            type="submit"
            disabled={isLoading || !selfie}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 font-medium rounded-[14px] bg-[var(--color-bg-button)] text-white border border-[var(--color-border-accent)] shadow-[0_0_10px_1px_var(--color-shadow-button)] hover:shadow-[0_0_15px_3px_var(--color-shadow-button-hover)] transition-all duration-300 w-full disabled:bg-gray-700 disabled:border-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"></span>{" "}
            <span className="relative z-10 font-semibold tracking-wide flex items-center gap-2">
              {isLoading && <Loader />}
              {isLoading
                ? "Processing..."
                : selfie
                ? "Create Account"
                : "Capture Photo First"}
            </span>
          </button>
        </div>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[var(--color-text-accent)] hover:text-cyan-300 text-sm transition-colors"
          >
            Already have an account? Login here
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
