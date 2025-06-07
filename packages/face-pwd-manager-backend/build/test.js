"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/test.ts
const db_1 = __importDefault(require("./db"));
async function main() {
    // Fetch all users (this will be empty at first)
    const users = await db_1.default.user.findMany();
    console.log("Users:", users);
}
main() // to run -> npx ts-node src/test.ts
    .catch((error) => {
    console.error("Error:", error);
})
    .finally(async () => {
    // Disconnect the Prisma Client at the end of the script
    await db_1.default.$disconnect();
});
