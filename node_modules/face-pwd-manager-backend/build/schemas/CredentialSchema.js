"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialUpdateSchema = exports.CredentialCreateSchema = void 0;
const zod_1 = require("zod");
exports.CredentialCreateSchema = zod_1.z.object({
    website: zod_1.z.string().nonempty({ message: "Website is required" }),
    title: zod_1.z.string().optional(), // generated server-side if missing
    username: zod_1.z.string().nonempty({ message: "Username is required" }),
    password: zod_1.z.string().nonempty({ message: "Password is required" }),
    userId: zod_1.z.number().int(),
});
exports.CredentialUpdateSchema = exports.CredentialCreateSchema.partial();
