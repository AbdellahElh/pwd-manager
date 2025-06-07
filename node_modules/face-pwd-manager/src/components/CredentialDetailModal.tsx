import React, { useState } from "react";
import { CredentialEntry } from "../models/Credential";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import {
  ClipboardIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
} from "./icons/Icons";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

interface CredentialDetailModalProps {
  credential: CredentialEntry;
  onDelete: (id: number) => void;
  onUpdate: (updatedCredential: CredentialEntry) => Promise<void>;
}

const CredentialDetailModal: React.FC<CredentialDetailModalProps> = ({
  credential,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CredentialEntry>({ ...credential });
  const handleCopy = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value);
    showSuccessToast(`${fieldName} copied to clipboard`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
      showSuccessToast("Credential updated successfully");
    } catch (error) {
      showErrorToast("Failed to update credential");
      console.error("Error updating credential:", error);
    }
  };
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this credential?")) {
      onDelete(credential.id);
      showSuccessToast("Credential deleted successfully");
    }
  };
  const openWebsite = () => {
    let url = credential.website;
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    showSuccessToast(`Opening ${credential.title || credential.website}`);
  };

  // Input field component for view mode
  const ReadOnlyField = ({
    label,
    value,
    onCopy,
    icon = null,
  }: {
    label: string;
    value: string;
    onCopy: () => void;
    icon?: React.ReactNode;
  }) => (
    <div className="mb-4">
      <label className="block text-gray-400 text-sm font-medium mb-1">
        {label}:
      </label>
      <div className="relative">
        <input
          type={label === "Password" && !showPassword ? "password" : "text"}
          value={value}
          readOnly
          className="w-full p-2 bg-[#151515] border border-gray-700 rounded-lg text-white focus:outline-none"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {icon}
          <button
            type="button"
            onClick={onCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title={`Copy ${label.toLowerCase()}`}
          >
            <ClipboardIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 w-full max-w-md">
      <h2 className="text-xl font-bold mb-6">
        {isEditing ? "Edit" : "View"} Credential
      </h2>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-1">
              Website
            </label>
            <div className="relative">
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full p-2 pr-10 bg-[#181818] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={() => openWebsite()}
                  className="text-gray-400 hover:text-white"
                  title="Open website"
                >
                  <ExternalLinkIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(formData.website, "Website URL")}
                  className="text-gray-400 hover:text-white"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 pr-10 bg-[#181818] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => handleCopy(formData.title, "Title")}
              >
                <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 pr-10 bg-[#181818] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => handleCopy(formData.username, "Username")}
              >
                <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 pr-20 bg-[#181818] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-600"
              />
              {isEditing && (
                <PasswordStrengthMeter password={formData.password} />
              )}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    showSuccessToast(
                      showPassword ? "Password hidden" : "Password visible"
                    );
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(formData.password, "Password")}
                >
                  <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-[#0a0a0a] text-white hover:text-red-600 rounded-lg border border-transparent hover:border-red-600 transition flex items-center gap-1"
            >
              <TrashIcon className="h-5 w-5" /> Delete
            </button>
            <div className="flex gap-2">
              {" "}
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  showSuccessToast("Edit cancelled");
                }}
                className="px-4 py-2 bg-[#0a0a0a] text-white hover:text-gray-400 rounded-lg border border-transparent hover:border-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="bg-[#181818] rounded-lg p-4 border border-gray-700">
            <ReadOnlyField
              label="Username"
              value={credential.username}
              onCopy={() => handleCopy(credential.username, "Username")}
            />

            <ReadOnlyField
              label="Password"
              value={credential.password}
              onCopy={() => handleCopy(credential.password, "Password")}
              icon={
                <button
                  onClick={() => {
                    setShowPassword(!showPassword);
                    showSuccessToast(
                      showPassword ? "Password hidden" : "Password visible"
                    );
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />
          </div>

          <div className="bg-[#181818] rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium mb-3">Site Information</h3>
            <ReadOnlyField
              label="Website"
              value={credential.website}
              onCopy={() => handleCopy(credential.website, "Website URL")}
              icon={
                <button
                  onClick={openWebsite}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Open website"
                >
                  <ExternalLinkIcon className="h-5 w-5" />
                </button>
              }
            />

            {credential.title && (
              <ReadOnlyField
                label="Title"
                value={credential.title}
                onCopy={() => handleCopy(credential.title, "Title")}
              />
            )}
          </div>

          <div className="pt-4 flex justify-end">
            {" "}
            <button
              onClick={() => {
                setIsEditing(true);
                showSuccessToast("Edit mode activated");
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialDetailModal;
