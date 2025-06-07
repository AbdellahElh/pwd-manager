// src/components/AddCredential.tsx
import React, { useState } from "react";
import generateStrongPassword from "./GeneratePwd";
import { EyeIcon, EyeOffIcon, PlusIcon } from "./icons/Icons";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

interface AddCredentialProps {
  onAddCredential: (
    website: string,
    title: string,
    username: string,
    password: string
  ) => void;
}

const AddCredential: React.FC<AddCredentialProps> = ({ onAddCredential }) => {
  const [website, setWebsite] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handleAdd = () => {
    if (!website || !username || !password) return;
    onAddCredential(website, title, username, password);
    resetForm();
  };

  const resetForm = () => {
    setWebsite("");
    setTitle("");
    setUsername("");
    setPassword("");
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(10);
    setPassword(generated);
  };

  const toggleVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold mb-2 text-center">Add New Credential</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">
            Website URL
          </label>
          <input
            id="website"
            type="text"
            placeholder="e.g., www.instagram.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title (Optional)
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Instagram Account"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username/Email
          </label>
          <input
            id="username"
            type="text"
            placeholder="e.g., user@service.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-600 transition">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter or generate password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 flex-grow outline-none"
            />{" "}
            <div className="flex pr-3">
              <button
                onClick={toggleVisibility}
                title={passwordVisible ? "Hide password" : "Show password"}
                className="p-1"
                type="button"
              >
                {passwordVisible ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                )}
              </button>
              <button
                onClick={handleGeneratePassword}
                title="Generate strong password"
                className="p-1"
                type="button"
              >
                <PlusIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
              </button>
            </div>
          </div>
          {password && <PasswordStrengthMeter password={password} />}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleAdd}
          className="bg-[#0a0a0a] text-white hover:text-blue-600 px-4 py-2 rounded-lg border border-transparent hover:border-blue-600 transition"
        >
          Save Credential
        </button>
      </div>
    </div>
  );
};

export default AddCredential;