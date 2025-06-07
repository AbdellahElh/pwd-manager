import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import AddPwd from "../components/AddCredential";
import CredentialDetailModal from "../components/CredentialDetailModal";
import CredentialList from "../components/CredentialList";
import ImportExportModal from "../components/ImportExportModal";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { CredentialEntry } from "../models/Credential";
import {
  createCredential,
  deleteCredential,
  fetchCredentials,
  updateCredential,
} from "../services/credentialService";
import { ImportCredential } from "../utils/importExportUtils";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

const PasswordManager: React.FC = () => {
  const { user, isLoggedIn, encryptionKey } = useAuth();
  const userId = user?.id;
  const [showAddCredentialModal, setShowAddCredentialModal] =
    useState<boolean>(false);
  const [showImportExportModal, setShowImportExportModal] =
    useState<boolean>(false);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: number]: boolean;
  }>({});

  // Custom fetcher function that uses our credential service
  const credentialFetcher = async (url: string) => {
    const id = Number(userId);
    if (isNaN(id) || !encryptionKey) return [];
    return await fetchCredentials(id, encryptionKey);
  };

  // Only fetch once we have a valid userId
  const swrKey = userId != null ? `/credentials/user/${userId}` : null;
  const { data: credentials = [], error } = useSWR<CredentialEntry[]>(
    swrKey,
    credentialFetcher
  );

  const handleAddCredential = async (
    website: string,
    title: string,
    username: string,
    password: string
  ) => {
    if (!userId || !encryptionKey) {
      showErrorToast("Authentication error. Please log in again.");
      return;
    }
    try {
      const newCredential = {
        website,
        title,
        username,
        password,
        userId: userId,
      };

      const createdEntry = await createCredential(
        newCredential,
        userId,
        encryptionKey
      );

      // Update the SWR cache with the new credential
      mutate(
        `/credentials/user/${userId}`,
        [...credentials, createdEntry],
        false
      );

      // Close the modal after successful creation
      setShowAddCredentialModal(false);
      showSuccessToast("Credential added successfully");
    } catch (err) {
      console.error("Error adding credential:", err);
      showErrorToast("Failed to add credential");
    }
  };
  const handleUpdateCredential = async (updatedCredential: CredentialEntry) => {
    if (!encryptionKey || !userId) {
      showErrorToast("Authentication error. Please log in again.");
      return;
    }

    try {
      // Make sure userId is included in the update
      const credentialToUpdate: CredentialEntry = {
        ...updatedCredential,
        userId: userId,
      };

      const updated = await updateCredential(credentialToUpdate, encryptionKey);

      // Update the SWR cache with the updated credential
      mutate(
        `/credentials/user/${userId}`,
        credentials.map((c) => (c.id === updated.id ? updated : c)),
        false
      );
    } catch (err) {
      console.error("Error updating credential:", err);
      throw err;
    }
  };

  const handleDeleteCredential = async (id: number) => {
    try {
      await deleteCredential(id);

      // Update the SWR cache to remove the deleted credential
      mutate(
        `/credentials/user/${userId}`,
        credentials.filter((entry) => entry.id !== id),
        false
      );

      showSuccessToast("Credential deleted successfully");
    } catch (err) {
      console.error("Error deleting credential:", err);
      showErrorToast("Failed to delete credential");
    }
  };

  const toggleVisibility = (id: number) => {
    const newVisibility = !visiblePasswords[id];
    setVisiblePasswords((prev) => ({ ...prev, [id]: newVisibility }));
    showSuccessToast(newVisibility ? "Password visible" : "Password hidden");
  };

  const handleCredentialClick = (credential: CredentialEntry) => {
    setSelectedCredential(credential);
  };

  const handleImportCredentials = async (
    importedCredentials: ImportCredential[]
  ) => {
    if (!userId || !encryptionKey) {
      showErrorToast("Authentication error. Please log in again.");
      return;
    }

    try {
      let successCount = 0;
      let failureCount = 0;

      for (const importedCred of importedCredentials) {
        try {
          await createCredential(
            {
              website: importedCred.website,
              title: importedCred.title || "",
              username: importedCred.username,
              password: importedCred.password,
              userId: userId,
            },
            userId,
            encryptionKey
          );
          successCount++;
        } catch (error) {
          console.error("Failed to import credential:", error);
          failureCount++;
        }
      }

      // Refresh the credentials list
      mutate(`/credentials/user/${userId}`);

      if (successCount > 0) {
        showSuccessToast(
          `Successfully imported ${successCount} credential(s)` +
            (failureCount > 0 ? ` (${failureCount} failed)` : "")
        );
      } else {
        showErrorToast("Failed to import any credentials");
      }
    } catch (error) {
      console.error("Error importing credentials:", error);
      showErrorToast("Failed to import credentials");
    }
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 mb-4">
          Error loading credentials. Please try again.
        </div>
      )}
      <section className="rounded-lg p-6 shadow-[0_0_5px_0_rgba(255,255,255,0.5)]">
        {" "}
        <CredentialList
          credentials={credentials}
          visiblePasswords={visiblePasswords}
          onToggleVisibility={toggleVisibility}
          onDelete={handleDeleteCredential}
          onAddNew={() => setShowAddCredentialModal(true)}
          onCredentialClick={handleCredentialClick}
          onImportExport={() => setShowImportExportModal(true)}
        />
      </section>{" "}
      <Modal
        isOpen={showAddCredentialModal}
        onClose={() => setShowAddCredentialModal(false)}
      >
        <AddPwd onAddCredential={handleAddCredential} />
      </Modal>
      <Modal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
      >
        <ImportExportModal
          credentials={credentials}
          onImport={handleImportCredentials}
          onClose={() => setShowImportExportModal(false)}
        />
      </Modal>
      <Modal
        isOpen={selectedCredential !== null}
        onClose={() => setSelectedCredential(null)}
      >
        {selectedCredential && (
          <CredentialDetailModal
            credential={selectedCredential}
            onDelete={handleDeleteCredential}
            onUpdate={handleUpdateCredential}
          />
        )}
      </Modal>
    </div>
  );
};

export default PasswordManager;
