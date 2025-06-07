import React from "react";
import { User } from "../models/User";
import { LogoutIcon } from "./icons/Icons";

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  // Get the first two characters from the email
  const initials = user.email.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
        {initials}
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold">{user.email}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">facelock.com</p>
      </div>

      <button
        onClick={onLogout}
        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
      >
        <LogoutIcon className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
