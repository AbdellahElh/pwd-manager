import { z } from "zod";

export const CredentialCreateSchema = z.object({
  website: z.string().nonempty({ message: "Website is required" }),
  title: z.string().optional(),        // generated server-side if missing
  username: z.string().nonempty({ message: "Username is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
  userId: z.number().int(),
});

export const CredentialUpdateSchema = CredentialCreateSchema.partial();
