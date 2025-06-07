"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEmailSchema = void 0;
// src/schemas/UserSchema.ts
const zod_1 = require("zod");
// Registration and login both just need an email
exports.UserEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
