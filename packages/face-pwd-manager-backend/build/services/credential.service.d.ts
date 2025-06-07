import { NewCredentialEntry } from '../models/Credential';
export declare function getAllCredentials(): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    website: string;
    title: string | null;
    username: string;
    password: string;
    userId: number;
}[]>;
export declare function getCredentialById(id: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    website: string;
    title: string | null;
    username: string;
    password: string;
    userId: number;
} | null>;
export declare function getCredentialsByUserId(userId: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    website: string;
    title: string | null;
    username: string;
    password: string;
    userId: number;
}[]>;
export declare function createCredential(data: NewCredentialEntry): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    website: string;
    title: string | null;
    username: string;
    password: string;
    userId: number;
}>;
export declare function updateCredential(id: number, data: Partial<NewCredentialEntry>): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    website: string;
    title: string | null;
    username: string;
    password: string;
    userId: number;
}>;
export declare function deleteCredential(id: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    website: string;
    title: string | null;
    username: string;
    password: string;
    userId: number;
}>;
export declare function getTitleFromWebsite(website: string): string;
//# sourceMappingURL=credential.service.d.ts.map