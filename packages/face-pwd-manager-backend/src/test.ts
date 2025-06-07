// src/test.ts
import prisma from "./db";

async function main() {
  // Fetch all users (this will be empty at first)
  const users = await prisma.user.findMany();
  console.log("Users:", users);
}

main() // to run -> npx ts-node src/test.ts
  .catch((error) => {
    console.error("Error:", error);
  })
  .finally(async () => {
    // Disconnect the Prisma Client at the end of the script
    await prisma.$disconnect();
  });
