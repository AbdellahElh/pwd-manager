"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db.ts
const client_1 = require("./generated/client");
const prisma = new client_1.PrismaClient();
exports.default = prisma;
