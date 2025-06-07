// src/server.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { httpsEnforcer } from "./middleware/httpsEnforcer";
import credentialRoutes from "./routes/CredentialRoutes";
import userRoutes from "./routes/UserRoutes";
import { loadModelsOnce } from "./services/user.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply HTTPS enforcement middleware early in the pipeline
app.use(httpsEnforcer);

// Set secure headers
app.use((req, res, next) => {
  // HTTP Strict Transport Security - force clients to use HTTPS
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS protection in browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  next();
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Load face-api models before accepting requests for performance
loadModelsOnce().catch((err) => {
  console.error("Failed to load face-api models:", err);
  process.exit(1);
});

app.use("/api/users", userRoutes);
app.use("/api/credentials", credentialRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
