export interface CredentialEntry {
  id: number;
  website: string;
  title?: string;
  username: string;
  password: string;
  userId: number;
}

export type NewCredentialEntry = Omit<CredentialEntry, "id">;
