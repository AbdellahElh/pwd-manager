// src/services/credential.service.ts
import prisma from "../db";
import { handleDbError } from "../middleware/handleDbError";
import { NewCredentialEntry } from "../models/Credential";
import { ServiceError } from "./ServiceError";

async function credentialExists(id: number): Promise<void> {
  try {
    const credential = await prisma.credential.findUnique({ where: { id } });
    if (!credential) {
      throw ServiceError.notFound(`Credential with id ${id} not found`);
    }
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function getAllCredentials() {
  try {
    return await prisma.credential.findMany();
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function getCredentialById(id: number) {
  try {
    await credentialExists(id);
    return await prisma.credential.findUnique({ where: { id } });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function getCredentialsByUserId(userId: number) {
  try {
    return await prisma.credential.findMany({ where: { userId } });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function createCredential(data: NewCredentialEntry) {
  try {
    const { website, title, username, password, userId } = data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ServiceError.notFound(`User with id ${userId} does not exist`);
    }
    // Normalize website URL
    if (!website.startsWith("http") || website.startsWith("www")) {
      data.website = `https://${website}`;
    }
    // If title is empty, generate it from the website.
    data.title = title || getTitleFromWebsite(data.website);

    return await prisma.credential.create({ data });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function updateCredential(
  id: number,
  data: Partial<NewCredentialEntry>
) {
  try {
    await credentialExists(id);
    const updateData: Record<string, any> = {};
    if (data.userId !== undefined) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) {
        throw ServiceError.notFound(`User with id ${data.userId} not found`);
      }
      updateData.userId = data.userId;
    }
    if (data.website) {
      updateData.website =
        !data.website.startsWith("http") || data.website.startsWith("www")
          ? `https://${data.website}`
          : data.website;
    }
    if (data.title) {
      updateData.title = data.title;
    }
    if (data.username) {
      updateData.username = data.username;
    }
    if (data.password) {
      updateData.password = data.password;
    }
    if (!Object.keys(updateData).length) {
      throw ServiceError.validationFailed("No update data provided");
    }
    return await prisma.credential.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    throw handleDbError(error);
  }
}

export async function deleteCredential(id: number) {
  try {
    await credentialExists(id);
    return await prisma.credential.delete({
      where: { id },
    });
  } catch (error) {
    throw handleDbError(error);
  }
}

export function getTitleFromWebsite(website: string): string {
  try {
    const url = new URL(website);
    let host = url.hostname;
    if (host.startsWith("www.")) {
      host = host.slice(4);
    } else {
      host = website;
    }
    const domain = host.split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    console.error("Error parsing website URL:", error);
    return "Unknown";
  }
}
