// src/components/ImportExportModal.tsx
import React, { useState } from "react";
import { CredentialEntry } from "../models/Credential";
import {
  downloadFile,
  exportToCSV,
  exportToJSON,
  ImportCredential,
  parseCSVImport,
  parseJSONImport,
  readFile,
} from "../utils/importExportUtils";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { DownloadIcon, UploadIcon } from "./icons/Icons";

interface ImportExportModalProps {
  credentials: CredentialEntry[];
  onImport: (credentials: ImportCredential[]) => void;
  onClose: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  credentials,
  onImport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExportJSON = () => {
    try {
      const jsonData = exportToJSON(credentials);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadFile(
        jsonData,
        `passwords-export-${timestamp}.json`,
        "application/json"
      );
      showSuccessToast("📥 Credentials exported to JSON successfully!");
    } catch (error) {
      showErrorToast("Failed to export credentials to JSON");
    }
  };

  const handleExportCSV = () => {
    try {
      const csvData = exportToCSV(credentials);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadFile(csvData, `passwords-export-${timestamp}.csv`, "text/csv");
      showSuccessToast("📊 Credentials exported to CSV successfully!");
    } catch (error) {
      showErrorToast("Failed to export credentials to CSV");
    }
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const content = await readFile(file);
      let importedCredentials: ImportCredential[];

      if (importFormat === "json") {
        importedCredentials = parseJSONImport(content);
      } else {
        importedCredentials = parseCSVImport(content);
      }

      if (importedCredentials.length === 0) {
        throw new Error("No valid credentials found in the file");
      }
      onImport(importedCredentials);
      showSuccessToast(
        `🎉 Successfully imported ${
          importedCredentials.length
        } credential(s) from ${importFormat.toUpperCase()} file!`
      );
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import credentials";

      // Format multi-line error messages for better display
      const formattedMessage = errorMessage.replace(/\n/g, " | ");
      showErrorToast(formattedMessage);
    } finally {
      setIsProcessing(false);
      // Reset the file input
      event.target.value = "";
    }
  };

  return (
    <div className="p-6 max-w-md w-full">
      <h2 className="text-xl font-bold mb-6 text-center">
        Import / Export Credentials
      </h2>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-[#181818] rounded-lg p-1">
        <button
          onClick={() => setActiveTab("export")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeTab === "export"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <DownloadIcon className="h-4 w-4" />
          Export
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            activeTab === "import"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <UploadIcon className="h-4 w-4" />
          Import
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === "export" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Export {credentials.length} credential(s) to:
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              className="w-full p-3 bg-[#181818] border border-gray-600 rounded-lg hover:border-blue-600 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold">JSON</span>
              </div>
              <div className="text-left">
                <div className="font-medium">JSON Format</div>
                <div className="text-sm text-gray-400">
                  Structured data format, easy to re-import
                </div>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full p-3 bg-[#181818] border border-gray-600 rounded-lg hover:border-green-600 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold">CSV</span>
              </div>
              <div className="text-left">
                <div className="font-medium">CSV Format</div>
                <div className="text-sm text-gray-400">
                  Spreadsheet format, works with Excel
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === "import" && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Import credentials from a file:
          </div>
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">
              File Format:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setImportFormat("json")}
                className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                  importFormat === "json"
                    ? "border-blue-600 bg-blue-600/20 text-blue-400"
                    : "border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setImportFormat("csv")}
                className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                  importFormat === "csv"
                    ? "border-green-600 bg-green-600/20 text-green-400"
                    : "border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                CSV
              </button>
            </div>
          </div>
          {/* File Input */}
          <div className="space-y-2">
            <label
              htmlFor="import-file"
              className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors cursor-pointer text-center"
            >
              <UploadIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="text-sm font-medium text-gray-300">
                Click to select {importFormat.toUpperCase()} file
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {importFormat === "json"
                  ? "JSON files (.json)"
                  : "CSV files (.csv)"}
              </div>
            </label>
            <input
              id="import-file"
              type="file"
              accept={importFormat === "json" ? ".json" : ".csv"}
              onChange={handleFileImport}
              disabled={isProcessing}
              className="hidden"
            />
          </div>{" "}
          {/* Format Info */}
          <div className="p-3 bg-[#181818] rounded-lg border border-gray-700">
            <div className="text-sm font-medium mb-2">✅ Compatible With:</div>
            <div className="text-xs text-green-400 mb-3">
              Bitwarden, LastPass, 1Password, Dashlane, Chrome, Firefox exports
              and more!
            </div>

            <div className="text-sm font-medium mb-2">
              📋 Supported Formats:
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>
                <strong>JSON:</strong> Bitwarden exports (items/login
                structure), direct arrays, single objects
              </div>
              <div>
                <strong>CSV:</strong> Any CSV with recognizable column headers
              </div>
            </div>

            <div className="text-sm font-medium mb-2 mt-3">
              📋 Supported Field Names:
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>
                <strong>Website/URL:</strong> website, site, url, uri,
                login_uri, domain, host, server, location
              </div>
              <div>
                <strong>Username:</strong> username, user, login, email,
                login_username, account, identity
              </div>
              <div>
                <strong>Password:</strong> password, pass, login_password, pwd,
                secret, credential
              </div>
              <div>
                <strong>Title/Name:</strong> title, name, service, app,
                description, label, company
              </div>
            </div>

            <div className="text-xs text-blue-400 mt-3 p-2 bg-blue-950/30 rounded border border-blue-800">
              <strong>Smart Import:</strong> We automatically detect Bitwarden's
              nested structure, ignore irrelevant fields, and create fallback
              websites when missing. Field names are matched flexibly!
            </div>
          </div>
          {isProcessing && (
            <div className="text-center text-blue-400 text-sm">
              Processing file...
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#0a0a0a] text-white hover:text-gray-400 rounded-lg border border-transparent hover:border-gray-400 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImportExportModal;
