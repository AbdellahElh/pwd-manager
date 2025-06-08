# Face Password Manager - Backend

[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

The Express.js backend API for the Password Manager with Facial Recognition application. This package provides secure REST API endpoints for user authentication, password management, and biometric data handling.

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🔧 Prerequisites](#-prerequisites)
- [⚡ Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [🗄️ Database Setup](#️-database-setup)
- [🔐 API Endpoints](#-api-endpoints)
- [🛡️ Security Implementation](#️-security-implementation)
- [🚀 Development](#-development)
- [📚 Documentation](#-documentation)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

## 🚀 Features

### 🔒 Security & Authentication

- **JWT Authentication**: Secure token-based authentication system
- **Facial Recognition**: Biometric authentication with face-api.js integration
- **Password Encryption**: AES-256-GCM encryption with PBKDF2 key derivation
- **Secure Face Storage**: Encrypted biometric templates with privacy protection
- **Rate Limiting**: API rate limiting to prevent abuse

### 🛠️ Technical Features

- **RESTful API**: Well-structured REST endpoints with proper HTTP methods
- **Database ORM**: Prisma ORM with SQLite for efficient data management
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Error Handling**: Comprehensive error handling with detailed logging
- **CORS Support**: Configurable Cross-Origin Resource Sharing
- **Middleware Stack**: Authentication, validation, and security middleware

### 📊 Data Management

- **User Management**: User registration, authentication, and profile management
- **Credential Storage**: Secure password and credential management
- **Face Descriptors**: Biometric template storage and matching
- **Database Migrations**: Version-controlled database schema changes
- **Data Validation**: Input validation using Zod schemas

## 🔧 Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Package manager (comes with Node.js)
- **SQLite**: Database engine (automatically installed)
- **Canvas Dependencies**: For face recognition processing

### System Dependencies

**Windows:**

```bash
# Install Visual Studio Build Tools
npm install --global windows-build-tools

# Install Canvas dependencies
npm install canvas
```

**macOS:**

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Canvas dependencies
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Linux (Ubuntu/Debian):**

```bash
# Install Canvas dependencies
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

## ⚡ Quick Start

### From Monorepo Root

```bash
# Install all dependencies
npm run install:all

# Start development servers (includes frontend)
npm run dev

# Backend API will be available at http://localhost:3000
```

### Package-Specific Development

```bash
# Navigate to backend package
cd packages/face-pwd-manager-backend

# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run watch

# Build for production
npm run build
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the package root:

```env
# Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"

# Encryption Configuration
APP_SECRET_KEY="your-app-secret-key-for-encryption-DO-NOT-SHARE"
ENCRYPTION_SALT="your-32-character-hex-salt-string-here"

# Security Settings
ENFORCE_HTTPS="false"
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_WINDOW="15"
RATE_LIMIT_MAX="100"

# Face Recognition
FACE_RECOGNITION_THRESHOLD="0.6"
FACE_DESCRIPTOR_DIMENSIONS="128"
```

### Production Environment

```env
# Production Settings
NODE_ENV="production"
PORT=3000
ENFORCE_HTTPS="true"
CORS_ORIGIN="https://your-frontend-domain.com"

# Secure Database URL
DATABASE_URL="file:./prisma/production.db"

# Strong JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-production-jwt-secret-64-chars-minimum"

# Secure App Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
APP_SECRET_KEY="your-production-app-secret-key-64-chars-minimum"

# Secure Encryption Salt (generate with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
ENCRYPTION_SALT="your-production-encryption-salt-32-chars"
```

## 🗄️ Database Setup

### Initial Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with test data
npm run db:seed
```

### Database Management Commands

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `npx prisma studio`        | Open Prisma Studio for database inspection |
| `npx prisma migrate dev`   | Create and apply new migration             |
| `npx prisma migrate reset` | Reset database and apply all migrations    |
| `npx prisma db push`       | Push schema changes without migrations     |
| `npm run db:seed`          | Seed database with test data               |

### Database Schema

```prisma
model User {
  id               String        @id @default(cuid())
  email            String        @unique
  faceDescriptor   String        // Encrypted face template
  encryptionSalt   String        // User-specific encryption salt
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  credentials      Credential[]
}

model Credential {
  id          String   @id @default(cuid())
  userId      String
  website     String
  username    String
  password    String   // Encrypted password
  notes       String?  // Encrypted notes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🔐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description                             | Authentication |
| ------ | ----------- | --------------------------------------- | -------------- |
| `POST` | `/register` | Register new user with face data        | None           |
| `POST` | `/login`    | Authenticate user with face recognition | None           |
| `POST` | `/refresh`  | Refresh JWT token                       | JWT Token      |
| `POST` | `/logout`   | Logout and invalidate token             | JWT Token      |

### User Routes (`/api/users`)

| Method   | Endpoint   | Description                  | Authentication |
| -------- | ---------- | ---------------------------- | -------------- |
| `GET`    | `/profile` | Get user profile information | JWT Token      |
| `PUT`    | `/profile` | Update user profile          | JWT Token      |
| `DELETE` | `/account` | Delete user account          | JWT Token      |

### Credential Routes (`/api/credentials`)

| Method   | Endpoint | Description              | Authentication |
| -------- | -------- | ------------------------ | -------------- |
| `GET`    | `/`      | Get all user credentials | JWT Token      |
| `POST`   | `/`      | Create new credential    | JWT Token      |
| `GET`    | `/:id`   | Get specific credential  | JWT Token      |
| `PUT`    | `/:id`   | Update credential        | JWT Token      |
| `DELETE` | `/:id`   | Delete credential        | JWT Token      |

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": any,
  "message": string
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any
  }
}
```

## 🛡️ Security Implementation

### Encryption Details

- **Algorithm**: AES-256-GCM for symmetric encryption
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt Management**: Unique salts per user and operation
- **IV Generation**: Cryptographically secure random IVs
- **Authentication**: GCM mode provides built-in authentication

### Face Recognition Security

- **Template Protection**: Face descriptors encrypted before storage
- **Threshold Validation**: Configurable similarity thresholds
- **No Raw Storage**: Facial images never stored on server
- **Privacy Preservation**: Biometric templates are one-way only

### Network Security

- **HTTPS Enforcement**: Configurable HTTPS-only mode
- **CORS Protection**: Whitelisted origins only
- **Rate Limiting**: Configurable request rate limits
- **Security Headers**: Comprehensive security header implementation
- **Input Validation**: Zod schema validation for all inputs

For comprehensive security details, see [Security Documentation](../../docs/SECURITY.md).

## 🚀 Development

### Available Scripts

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start development server with ts-node      |
| `npm run watch`   | Start development server with auto-restart |
| `npm run build`   | Build TypeScript to JavaScript             |
| `npm run start`   | Start production server                    |
| `npm run lint`    | Run ESLint for code quality                |
| `npm run format`  | Format code with Prettier                  |
| `npm run migrate` | Run database migrations                    |
| `npm run studio`  | Open Prisma Studio                         |

### Development Workflow

1. **API Development**:

   ```bash
   npm run watch
   # Server automatically restarts on file changes
   # API available at http://localhost:3000/api
   ```

2. **Database Changes**:

   ```bash
   # Modify schema.prisma
   npx prisma migrate dev --name "your-migration-name"
   # Generates migration and updates database
   ```

3. **Testing API Endpoints**:
   ```bash
   # Use Postman, curl, or your preferred API client
   # JWT tokens required for protected routes
   ```

### Project Structure

```
src/
├── server.ts            # Main application entry point
├── db.ts               # Database connection and configuration
├── middleware/         # Express middleware functions
│   ├── auth.ts        # JWT authentication middleware
│   ├── errorHandler.ts # Global error handling
│   ├── asyncHandler.ts # Async error wrapper
│   └── httpsEnforcer.ts # HTTPS enforcement
├── routes/            # API route definitions
│   ├── UserRoutes.ts  # User management endpoints
│   └── CredentialRoutes.ts # Password management endpoints
├── services/          # Business logic and external services
│   ├── AuthService.ts # Authentication logic
│   ├── FaceService.ts # Face recognition processing
│   └── EncryptionService.ts # Encryption/decryption
├── models/           # Prisma model extensions
├── schemas/          # Zod validation schemas
├── utils/            # Utility functions and helpers
└── generated/        # Prisma generated files
```

## 📚 Documentation

### Related Documentation

- [Main Project README](../../README.md) - Project overview and setup
- [Frontend Documentation](../face-pwd-manager-frontend/README.md) - React application details
- [Security Guide](../../docs/SECURITY.md) - Comprehensive security documentation
- [Encryption Details](../../docs/ENCRYPTION.md) - Technical encryption implementation
- [Face Recognition Security](../../docs/FACE_ENCRYPTION.md) - Biometric data protection
- [HTTPS Setup](../../docs/HTTPS_SETUP.md) - SSL/TLS configuration
- [Implementation Guide](../../docs/IMPLEMENTATION.md) - Technical implementation details
- [Monorepo Workflow](../../docs/MONOREPO_WORKFLOW.md) - Development processes

### Technical References

- [Express.js Documentation](https://expressjs.com/) - Web framework
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM
- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js) - Face recognition library
- [SQLite Documentation](https://www.sqlite.org/docs.html) - Database engine

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**

```bash
# Reset and recreate database
npx prisma migrate reset --force
npx prisma migrate dev

# Regenerate Prisma client
npx prisma generate
```

**Canvas/Face Recognition Issues**

```bash
# Reinstall canvas with proper build tools
npm uninstall canvas
npm install canvas --build-from-source

# On Windows, may need Visual Studio Build Tools
npm install --global windows-build-tools
```

**Port Already in Use**

```bash
# Kill process using port 3000
npx kill-port 3000

# Or change port in .env file
PORT=3001
```

**JWT Token Issues**

```bash
# Ensure JWT_SECRET is set and sufficiently long
# Generate new secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check token expiration settings
JWT_EXPIRES_IN="7d"
```

### Performance Optimization

1. **Database Optimization**:

   - Use database indexes for frequently queried fields
   - Implement pagination for large datasets
   - Use connection pooling for high-traffic applications

2. **Memory Management**:

   - Face recognition models are cached in memory
   - Implement garbage collection for long-running processes
   - Monitor memory usage in production

3. **API Performance**:
   - Implement response caching where appropriate
   - Use compression middleware for large responses
   - Optimize database queries with Prisma

### Monitoring and Logging

```bash
# View application logs
npm run start | tee app.log

# Monitor database connections
npx prisma studio

# Check API health
curl http://localhost:3000/api/health
```

## 🤝 Contributing

Please see the [main project README](../../README.md) for contribution guidelines.

### Backend-Specific Guidelines

1. Follow RESTful API design principles
2. Use TypeScript for all new code
3. Implement proper error handling with try-catch blocks
4. Add input validation using Zod schemas
5. Write comprehensive JSDoc comments
6. Test API endpoints thoroughly
7. Follow security best practices for authentication and data handling
8. Update Prisma schema with proper migrations

---

**⚠️ Security Notice**: This backend handles sensitive biometric and credential data. Always use environment variables for secrets and enable HTTPS in production.

**💡 Need Help?** Check the troubleshooting section above or refer to the comprehensive documentation in the `/docs` directory.

```bash
cd pwd-manager-backend
npm run dev
```

Frontend (in a separate terminal):

```bash
cd pwd-manager-frontend
npm run dev
```

## Configuration

- **Environment Variables:**

  Backend (in `.env`):

  ```
  DATABASE_URL="file:./dev.db"
  PORT=3000
  JWT_SECRET="your_jwt_secret_key_here"
  NODE_ENV="development"
  ENFORCE_HTTPS="false"
  ENCRYPTION_SALT="random_hex_string_32_chars"
  APP_SECRET_KEY="app-secret-key-for-encryption-DO-NOT-SHARE"
  ```

  Frontend (in `.env`):

  ```
  VITE_SECRET_KEY="secret-key-same-as-backend-APP_SECRET_KEY"
  VITE_BACKEND_URL="http://localhost:3000/api"
  VITE_ENCRYPTION_SALT="same-as-backend-ENCRYPTION_SALT"
  ```

- **Face Recognition Models:**
  The required face-api.js models are already included in the repository in both the frontend and backend public directories:
  ```
  /models
    face_recognition_model-weights_manifest.json
    face_recognition_model-shard1
    face_recognition_model-shard2
    ssd_mobilenetv1_model-weights_manifest.json
    ssd_mobilenetv1_model-shard1
    ssd_mobilenetv1_model-shard2
    face_landmark_68_model-weights_manifest.json
    face_landmark_68_model-shard1
  ```

## Security Considerations

- **End-to-End Encryption:**  
  All sensitive data (passwords, usernames, face images) are encrypted using AES-256 encryption before transmission or storage. Face images are encrypted client-side before being sent to the server for processing.
- **Unique User Keys:**  
  Each user gets a unique encryption key derived from their user ID and email, ensuring that even if data is leaked, it cannot be easily decrypted without user-specific information.
- **Biometric Data Protection:**  
  Face images are encrypted during transmission, and only the mathematical face descriptors (not actual images) are stored long-term. These descriptors cannot be reversed to recreate face images.

- **HTTPS Enforcement:**  
  Both frontend and backend enforce HTTPS connections in production environments, with automatic redirects from HTTP to HTTPS. See [HTTPS Setup Guide](docs/HTTPS_SETUP.md) for detailed instructions.
- **Security Warnings:**  
  The application displays clear security warnings when used over insecure connections, ensuring users are aware of potential risks.

## Troubleshooting

- **Login Authentication Issues:**

  - If face recognition fails, ensure good lighting and proper face positioning.
  - Try refreshing the page if the camera doesn't start automatically.
  - Clear browser cache and cookies if persistent problems occur.

- **Backend Connection Issues:**
  - Ensure both frontend and backend servers are running.
  - Check that the frontend is correctly configured to connect to the backend URL.
  - Verify that your firewall or security software isn't blocking connections.

## Security Documentation

For a detailed explanation of all security features implemented in this application, please refer to our [Security Guide](docs/SECURITY.md). This comprehensive document covers:

- End-to-end encryption implementation details
- Key derivation and strengthening techniques
- Biometric data security measures
- HTTPS enforcement mechanisms
- Best practices for users and administrators

Additional security documents:

- [Encryption Implementation](docs/ENCRYPTION.md)
- [Face Encryption](docs/FACE_ENCRYPTION.md)

## Implementation Details

This project implements a secure password manager using a modern client-server architecture with facial recognition for authentication. The system was developed with security as the primary focus, using industry-standard encryption and biometric verification techniques.

### Key Implementation Features

- **Face Recognition System**: Implemented using face-api.js, which extracts 128-dimensional face descriptors for highly accurate face matching
- **End-to-End Encryption**: All sensitive data is encrypted client-side using AES-256-CBC with PBKDF2 key derivation
- **Secure Architecture**: Clear separation between frontend (React) and backend (Node.js/Express) with encrypted communication
- **Database Design**: Efficient schema using Prisma ORM with SQLite for persistent storage
- **Security Measures**: HTTPS enforcement, protection against common web vulnerabilities, and secure credential handling

For a comprehensive breakdown of the implementation, including technical architecture, algorithms used, development approach, and challenges overcome during development, please refer to our [Implementation Documentation](docs/IMPLEMENTATION.md).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub. Ensure that your code passes lint checks and that you've tested your changes thoroughly before proposing them.

## License

This project is licensed under the [MIT License](LICENSE), meaning you are free to use, modify, and distribute it as you please.

---

**Enjoy the convenience and security of managing your passwords with face authentication!**
