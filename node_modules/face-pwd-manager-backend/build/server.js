"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("./middleware/errorHandler");
const httpsEnforcer_1 = require("./middleware/httpsEnforcer");
const CredentialRoutes_1 = __importDefault(require("./routes/CredentialRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const user_service_1 = require("./services/user.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Apply HTTPS enforcement middleware early in the pipeline
app.use(httpsEnforcer_1.httpsEnforcer);
// Set secure headers
app.use((req, res, next) => {
    // HTTP Strict Transport Security - force clients to use HTTPS
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    // Enable XSS protection in browsers
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
// Load face-api models before accepting requests for performance
(0, user_service_1.loadModelsOnce)().catch((err) => {
    console.error("Failed to load face-api models:", err);
    process.exit(1);
});
app.use("/api/users", UserRoutes_1.default);
app.use("/api/credentials", CredentialRoutes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
