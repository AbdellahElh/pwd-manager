// src/models/User.ts
export interface UserEntry {
  id: number;
  email: string;
  faceDescriptor: number[];
}

export type NewUserEntry = Pick<UserEntry, "email">;
