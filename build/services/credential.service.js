"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCredentials = getAllCredentials;
exports.getCredentialById = getCredentialById;
exports.getCredentialsByUserId = getCredentialsByUserId;
exports.createCredential = createCredential;
exports.updateCredential = updateCredential;
exports.deleteCredential = deleteCredential;
exports.getTitleFromWebsite = getTitleFromWebsite;
// src/services/credential.service.ts
const db_1 = __importDefault(require("../db"));
const handleDbError_1 = require("../middleware/handleDbError");
const ServiceError_1 = require("./ServiceError");
async function credentialExists(id) {
    try {
        const credential = await db_1.default.credential.findUnique({ where: { id } });
        if (!credential) {
            throw ServiceError_1.ServiceError.notFound(`Credential with id ${id} not found`);
        }
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
async function getAllCredentials() {
    try {
        return await db_1.default.credential.findMany();
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
async function getCredentialById(id) {
    try {
        await credentialExists(id);
        return await db_1.default.credential.findUnique({ where: { id } });
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
async function getCredentialsByUserId(userId) {
    try {
        return await db_1.default.credential.findMany({ where: { userId } });
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
async function createCredential(data) {
    try {
        const { website, title, username, password, userId } = data;
        const user = await db_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw ServiceError_1.ServiceError.notFound(`User with id ${userId} does not exist`);
        }
        // Normalize website URL
        if (!website.startsWith("http") || website.startsWith("www")) {
            data.website = `https://${website}`;
        }
        // If title is empty, generate it from the website.
        data.title = title || getTitleFromWebsite(data.website);
        return await db_1.default.credential.create({ data });
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
async function updateCredential(id, data) {
    try {
        await credentialExists(id);
        const updateData = {};
        if (data.userId !== undefined) {
            const user = await db_1.default.user.findUnique({ where: { id: data.userId } });
            if (!user) {
                throw ServiceError_1.ServiceError.notFound(`User with id ${data.userId} not found`);
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
            throw ServiceError_1.ServiceError.validationFailed("No update data provided");
        }
        return await db_1.default.credential.update({
            where: { id },
            data: updateData,
        });
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
async function deleteCredential(id) {
    try {
        await credentialExists(id);
        return await db_1.default.credential.delete({
            where: { id },
        });
    }
    catch (error) {
        throw (0, handleDbError_1.handleDbError)(error);
    }
}
function getTitleFromWebsite(website) {
    try {
        const url = new URL(website);
        let host = url.hostname;
        if (host.startsWith("www.")) {
            host = host.slice(4);
        }
        else {
            host = website;
        }
        const domain = host.split(".")[0];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    catch (error) {
        console.error("Error parsing website URL:", error);
        return "Unknown";
    }
}
