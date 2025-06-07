import React, { useEffect, useRef, useState } from "react";
import { CredentialEntry } from "../models/Credential";
import { showSuccessToast } from "../utils/toastUtils";
import { ClipboardIcon, EyeIcon, EyeOffIcon, TrashIcon } from "./icons/Icons";

interface CredentialProps {
  entry: CredentialEntry;
  visible: boolean;
  onToggleVisibility: (id: number) => void;
  onDelete: (id: number) => void;
  onClick: () => void;
}

const CredentialItem: React.FC<CredentialProps> = ({
  entry,
  visible,
  onToggleVisibility,
  onDelete,
  onClick,
}) => {
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleCopyUsername = () => {
    navigator.clipboard.writeText(entry.username);
    showSuccessToast("Username copied to clipboard");
    setShowCopyMenu(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(entry.password);
    showSuccessToast("Password copied to clipboard");
    setShowCopyMenu(false);
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCopyMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (e: React.MouseEvent) => {
    // Only trigger click if we're not clicking on a button
    const target = e.target as HTMLElement;
    if (
      target.tagName !== "BUTTON" &&
      !target.closest("button") &&
      target.tagName !== "svg" &&
      !target.closest("svg")
    ) {
      onClick();
    }
  };

  return (
    <li
      className="flex items-center justify-between py-2 whitespace-nowrap hover:bg-gray-900/30 px-2 rounded-md cursor-pointer transition-colors duration-200"
      onClick={handleItemClick}
    >
      <div className="flex-1 flex items-center lg:w-md md:w-sm sm:w-xs xs:w-xxs gap-x-2 md:gap-x-4 overflow-hidden">
        <strong className="text-sm md:text-base truncate">
          {entry.title || entry.website}:
        </strong>
        <span className="text-xs md:text-sm truncate">
          {visible ? entry.password : "••••••••"}
        </span>
      </div>
      <div className="flex items-center justify-end">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowCopyMenu(!showCopyMenu)}
            className="hover:text-gray-700 flex-shrink-0"
            title="Copy credentials"
          >
            <ClipboardIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          {showCopyMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-cyan-800 rounded-md shadow-lg z-50 overflow-hidden">
              <button
                onClick={handleCopyUsername}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#252525] flex items-center gap-2"
              >
                <ClipboardIcon className="h-4 w-4" /> Copy username
              </button>
              <button
                onClick={handleCopyPassword}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#252525] flex items-center gap-2"
              >
                <ClipboardIcon className="h-4 w-4" /> Copy password
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onToggleVisibility(entry.id)}
          className="hover:text-gray-700 flex-shrink-0"
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOffIcon className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <EyeIcon className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </button>

        <button
          onClick={() => onDelete(entry.id)}
          className="flex items-center gap-x-1 bg-[#0a0a0a] text-white hover:text-red-600 px-2 sm:px-3 py-1 rounded-lg border border-transparent hover:border-red-600 transition flex-shrink-0"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4 xs:h-3 xs:w-3 md:h-5 md:w-5" />
          <span className="hidden sm:inline text-xs md:text-sm">Delete</span>
        </button>
      </div>
    </li>
  );
};

export default CredentialItem;
