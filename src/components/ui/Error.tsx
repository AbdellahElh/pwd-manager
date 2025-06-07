import React from "react";

interface ErrorProps {
  message: string;
  onDismiss?: () => void;
}

const Error: React.FC<ErrorProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4">
      <div className="flex justify-between items-start">
        <p>{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 ml-2"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;
