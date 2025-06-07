import React from "react";

interface ProfileIconProps {
  email: string;
  onClick: () => void;
  className?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  email,
  onClick,
  className = "",
}) => {
  // Get the first two characters from the email (usually initial letter of name or first two letters of email)
  const initials = email.substring(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      title="Your Profile"
    >
      {initials}
    </button>
  );
};

export default ProfileIcon;
