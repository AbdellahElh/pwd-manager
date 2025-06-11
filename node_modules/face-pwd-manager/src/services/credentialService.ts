// src/services/credentialService.ts
import AES from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';
import { fetchAll, fetchById, post, put, remove } from '../data/apiClient';
import { CredentialEntry } from '../models/Credential';
import { strengthenKey } from '../utils/cryptoUtils';

// Interface for encrypted credential

interface EncryptedCredential extends Omit<CredentialEntry, 'password' | 'username'> {
  password: string; // Encrypted password
  username: string; // Encrypted username
}

/**
 * Process a single credential by encrypting sensitive fields
 * Uses pre-computed strengthened key for better performance
 */
const encryptCredential = (
  credential: CredentialEntry,
  strengthenedKey: string
): EncryptedCredential => {
  return {
    ...credential,
    username: credential.username
      ? AES.encrypt(credential.username, strengthenedKey).toString()
      : '',
    password: credential.password
      ? AES.encrypt(credential.password, strengthenedKey).toString()
      : '',
  };
};

/**
 * Process a single credential by decrypting sensitive fields
 * Uses pre-computed strengthened key for better performance
 */
const decryptCredential = (
  credential: EncryptedCredential,
  strengthenedKey: string
): CredentialEntry => {
  return {
    ...credential,
    username: credential.username
      ? AES.decrypt(credential.username, strengthenedKey).toString(UTF8)
      : '',
    password: credential.password
      ? AES.decrypt(credential.password, strengthenedKey).toString(UTF8)
      : '',
  };
};

/**
 * Process multiple credentials by decrypting sensitive fields efficiently
 * Pre-computes the strengthened key once for all credentials
 */
const decryptCredentials = (
  credentials: EncryptedCredential[],
  encryptionKey: string
): CredentialEntry[] => {
  // Pre-compute strengthened key once
  const strengthenedKey = strengthenKey(encryptionKey);

  const decryptedCredentials = credentials.map(cred => decryptCredential(cred, strengthenedKey));

  return decryptedCredentials;
};

/**
 * Fetch all credentials for a user and decrypt their passwords
 */
export const fetchCredentials = async (
  userId: number,
  encryptionKey: string | null
): Promise<CredentialEntry[]> => {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  const credentials = await fetchAll(`/credentials/user/${userId}`);

  // Use batch decryption for better performance
  const decryptedCredentials = decryptCredentials(credentials, encryptionKey);

  return decryptedCredentials;
};

/**
 * Fetch a single credential by ID and decrypt its password
 */
export const fetchCredentialById = async (
  id: number,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  const credential: EncryptedCredential = await fetchById(`/credentials/${id}`);
  const strengthenedKey = strengthenKey(encryptionKey);
  return decryptCredential(credential, strengthenedKey);
};

/**
 * Create a new credential with encrypted password
 */
export const createCredential = async (
  credential: Omit<CredentialEntry, 'id'>,
  userId: number,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Pre-compute strengthened key once
  const strengthenedKey = strengthenKey(encryptionKey);

  const encryptedCredential = encryptCredential(
    { ...credential, id: 0 } as CredentialEntry,
    strengthenedKey
  );

  const credentialWithUserId = {
    ...encryptedCredential,
    userId,
  };

  const createdCredential = await post<typeof credentialWithUserId, EncryptedCredential>(
    '/credentials',
    credentialWithUserId
  );

  return decryptCredential(createdCredential, strengthenedKey);
};

/**
 * Update an existing credential with encrypted password
 */
export const updateCredential = async (
  credential: CredentialEntry,
  encryptionKey: string | null
): Promise<CredentialEntry> => {
  if (!encryptionKey) {
    throw new Error('Encryption key is required');
  }

  // Pre-compute strengthened key once
  const strengthenedKey = strengthenKey(encryptionKey);

  const encryptedCredential = encryptCredential(credential, strengthenedKey);

  const updatedCredential = await put<EncryptedCredential, EncryptedCredential>(
    '/credentials',
    encryptedCredential
  );

  return decryptCredential(updatedCredential, strengthenedKey);
};

/**
 * Delete a credential by ID
 */
export const deleteCredential = async (id: number): Promise<void> => {
  await remove('/credentials', id);
};
