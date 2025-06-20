"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const payload = jsonwebtoken_1.default.verify(token, secret);
        // Attach the decoded payload to the request object
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
exports.authenticateJWT = authenticateJWT;
//# sourceMappingURL=auth.js.map