// src/schemas/UserSchema.ts
import { z } from "zod";

// Registration and login both just need an email
export const UserEmailSchema = z.object({
  email: z.string().email(),
});

