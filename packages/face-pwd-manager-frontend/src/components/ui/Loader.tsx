import React from "react";

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default Loader;
