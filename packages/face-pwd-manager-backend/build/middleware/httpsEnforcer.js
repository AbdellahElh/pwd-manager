"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpsEnforcer = void 0;
/**
 * Middleware to enforce HTTPS connections
 * Redirects HTTP requests to HTTPS in production environments
 */
const httpsEnforcer = (req, res, next) => {
    // Check environment variables to determine if we should enforce HTTPS
    const enforceHttps = process.env.ENFORCE_HTTPS === "true";
    const isDevelopment = process.env.NODE_ENV === "development";
    const isLocalhost = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    // Check if we're behind a proxy that's already handling HTTPS
    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
    // Only enforce HTTPS in production or when explicitly configured
    if (enforceHttps && !isSecure && !isDevelopment && !isLocalhost) {
        // Redirect to HTTPS with same URL
        const redirectUrl = `https://${req.hostname}${req.originalUrl}`;
        console.log(`Redirecting to HTTPS: ${redirectUrl}`);
        return res.redirect(301, redirectUrl);
    }
    next();
};
exports.httpsEnforcer = httpsEnforcer;
