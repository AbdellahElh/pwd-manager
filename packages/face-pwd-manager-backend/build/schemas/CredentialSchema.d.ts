import { z } from 'zod';
export declare const CredentialCreateSchema: z.ZodObject<{
    website: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    username: z.ZodString;
    password: z.ZodString;
    userId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    website: string;
    username: string;
    password: string;
    userId: number;
    title?: string | undefined;
}, {
    website: string;
    username: string;
    password: string;
    userId: number;
    title?: string | undefined;
}>;
export declare const CredentialUpdateSchema: z.ZodObject<{
    website: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    website?: string | undefined;
    title?: string | undefined;
    username?: string | undefined;
    password?: string | undefined;
    userId?: number | undefined;
}, {
    website?: string | undefined;
    title?: string | undefined;
    username?: string | undefined;
    password?: string | undefined;
    userId?: number | undefined;
}>;
//# sourceMappingURL=CredentialSchema.d.ts.map