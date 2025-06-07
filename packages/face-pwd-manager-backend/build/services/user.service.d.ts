import { NewUserEntry } from '../models/User';
export declare function loadModelsOnce(): Promise<void>;
export declare function registerUserWithImage(data: NewUserEntry, file: Express.Multer.File): Promise<{
    id: number;
    email: string;
    faceDescriptor: import("@/generated/client/runtime/library").JsonValue;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function authenticateWithFace(email: string, file?: Express.Multer.File): Promise<{
    user: {
        id: number;
        email: string;
    };
    token: string;
}>;
export declare function getAllUsers(): Promise<{
    id: number;
    email: string;
    faceDescriptor: import("@/generated/client/runtime/library").JsonValue;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getUserById(id: number): Promise<{
    id: number;
    email: string;
    faceDescriptor: import("@/generated/client/runtime/library").JsonValue;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function deleteUser(id: number): Promise<{
    id: number;
    email: string;
    faceDescriptor: import("@/generated/client/runtime/library").JsonValue;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=user.service.d.ts.map