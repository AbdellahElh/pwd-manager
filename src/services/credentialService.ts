// src/services/credentialService.ts
import { fetchAll, fetchById, post, put, remove } from "../data/apiClient";
import { CredentialEntry } from "../models/Credential";
import { decrypt, encrypt } from "../utils/cryptoUtils";

// Interface for encrypted credential

interface EncryptedCredential
  extends Omit<CredentialEntry, "password" | "username"> {
  password: string; // Encrypted password
  username: string; // Encrypted username
}

/**
 * Process a single credential by encrypting sensitive fields
 */
const encryptCredential = (
  credential: CredentialEntry,
  encryptionKey: string
): EncryptedCredential => {
  return {
    ...credential,
    username: encrypt(credential.username, encryptionKey),
    password: encrypt(credential.password, encryptionKey),
  };
};

/**
 * Process a single credential by decrypting sensitive fields
 */
const decryptCredential = (
  credential: EncryptedCredential,
  encryptionKey: string
): CredentialEntry => {
  return {
    ...credential,
    username: decrypt(credential.username, encryptionKey),
    password: decrypt(credential.password, encryptionKey),
  };
};

/**
 * Fetch all credentials for a user and decrypt their passwords
 */
export const fetchCredentials = async (
  userId: number,
  encryptionKey: string | null
): Promise<CredentialEntry[]> => {
  if (!encryptionKey) {
    throw new Error("Encryption key is required");
  }

  const credentials = await fetchAll(`/credentials/user/${userId}`);
  return credentials.map((cred: EncryptedCredential) =>
    decryptCredential(cred, encryptionKey)
  );
};

/**
 * Fetch a single credential by ID and decrypt its password
 */
export const fetchCredentialById = async (
  id: number,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error("Encryption key is required");
  }

  const credential = await fetchById(`/credentials/${id}`);
  return decryptCredential(credential, encryptionKey);
};

/**
 * Create a new credential with encrypted password
 */
export const createCredential = async (
  credential: Omit<CredentialEntry, "id">,
  userId: number,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error("Encryption key is required");
  }

  const encryptedCredential = encryptCredential(
    { ...credential, id: 0 } as CredentialEntry,
    encryptionKey
  );

  const credentialWithUserId = {
    ...encryptedCredential,
    userId,
  };

  const createdCredential = await post<
    typeof credentialWithUserId,
    EncryptedCredential
  >("/credentials", credentialWithUserId);

  return decryptCredential(createdCredential, encryptionKey);
};

/**
 * Update an existing credential with encrypted password
 */
export const updateCredential = async (
  credential: CredentialEntry,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error("Encryption key is required");
  }

  const encryptedCredential = encryptCredential(credential, encryptionKey);

  const updatedCredential = await put<EncryptedCredential, EncryptedCredential>(
    "/credentials",
    encryptedCredential
  );

  return decryptCredential(updatedCredential, encryptionKey);
};

/**
 * Delete a credential by ID
 */
export const deleteCredential = async (id: number): Promise<void> => {
  await remove("/credentials", id);
};
