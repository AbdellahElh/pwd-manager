import React from "react";
import { CredentialEntry } from "../models/Credential";
import CredentialItem from "./CredentialItem";
import { DownloadIcon, PlusIcon } from "./icons/Icons";

interface CredentialListProps {
  credentials: CredentialEntry[];
  visiblePasswords: { [key: number]: boolean };
  onToggleVisibility: (id: number) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
  onCredentialClick: (credential: CredentialEntry) => void;
  onImportExport: () => void;
}

const CredentialList: React.FC<CredentialListProps> = ({
  credentials,
  visiblePasswords,
  onToggleVisibility,
  onDelete,
  onAddNew,
  onCredentialClick,
  onImportExport,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl md:text-2xl font-bold">Your Credentials</h3>{" "}
        <div className="flex gap-2">
          <button
            onClick={onImportExport}
            className="group relative inline-flex items-center justify-center px-4 py-2.5 font-medium rounded-[14px] bg-[#001e29] text-white border border-purple-500 shadow-[0_0_10px_1px_rgba(168,85,247,0.4)] hover:shadow-[0_0_15px_3px_rgba(168,85,247,0.6)] transition-all duration-300"
            title="Import / Export credentials"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"></span>
            <span className="relative flex items-center gap-2 z-10">
              <DownloadIcon className="h-4 w-4" />
              <span className="font-semibold tracking-wide">Import/Export</span>
            </span>
          </button>
          <button
            onClick={onAddNew}
            className="group relative inline-flex items-center justify-center px-6 py-2.5 font-medium rounded-[14px] bg-[#001e29] text-white border border-cyan-500 shadow-[0_0_10px_1px_rgba(0,191,255,0.4)] hover:shadow-[0_0_15px_3px_rgba(0,191,255,0.6)] transition-all duration-300"
            title="Add new credential"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"></span>
            <span className="absolute inset-0 flex justify-center items-center overflow-hidden rounded-[14px]">
              <span className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4MGZmZmYiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
            </span>
            <span className="relative flex items-center gap-2 z-10">
              <PlusIcon className="h-5 w-5 mr-2.5 transform transition-transform duration-300 group-hover:rotate-90" />
              <span className="font-semibold tracking-wide">New</span>
            </span>
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {credentials.map((entry) => (
          <CredentialItem
            key={entry.id}
            entry={entry}
            visible={!!visiblePasswords[entry.id]}
            onToggleVisibility={onToggleVisibility}
            onDelete={onDelete}
            onClick={() => onCredentialClick(entry)}
          />
        ))}
      </ul>
    </div>
  );
};

export default CredentialList;
