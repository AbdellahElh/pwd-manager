# Web Browser Password Manager with Face Authentication

This project is a browser-based password management application enhanced with facial recognition technology. Users can authenticate themselves by positioning their face in front of the webcam, after which they can securely store, retrieve, and manage passwords. The application leverages [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face recognition and uses encryption for password storage.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Security Documentation](#security-documentation)
- [Implementation Details](#implementation-details)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Face Recognition Authentication:**  
  Users are authenticated via their webcam. After the face models load and the user's face matches the stored descriptor, access is granted to the password manager. The system uses face-api.js for accurate face detection and matching.
- **Secure Password Storage:**  
  Passwords are encrypted before being stored using industry-standard encryption algorithms and can be safely retrieved only after successful authentication.

- **User-Friendly Interface:**  
  A simple, clean UI allows you to add, view, and manage stored passwords with ease.

- **Secure Architecture:**  
  The application uses a modern client-server architecture with end-to-end encryption. Face descriptors and encrypted credentials are stored securely, with sensitive data never transmitted or stored as plaintext.

## Prerequisites

- **Node.js & npm:**  
  Ensure that you have Node.js (LTS version recommended) and npm installed on your system.

- **Modern Browser:**  
  A recent version of Chrome, Firefox, or Edge is required for `getUserMedia` and webcam access.  
  Note: HTTPS or `localhost` is often required for webcam permissions.

- **Webcam:**  
  A working webcam is necessary for face recognition.

## Installation

1. **Clone the Repositories:**

   ```bash
   # Clone backend repository
   git clone https://github.com/AbdellahElh/pwd-manager-backend.git

   # Clone frontend repository
   git clone https://github.com/AbdellahElh/pwd-manager-frontend.git
   ```

2. **Install Dependencies:**

   Backend:

   ```bash
   cd pwd-manager-backend
   npm install
   ```

   Frontend:

   ```bash
   cd pwd-manager-frontend
   npm install
   ```

3. **Set up Environment Files:**

   Create `.env` files for both repositories using the provided examples:

   Backend (create `.env` file based on `.env.example`):

   ```bash
   # Copy example env file
   cp .env.example .env
   # Then edit the .env file with your settings
   ```

   Frontend (create `.env` file based on `.env.example`):

   ```bash
   # Copy example env file
   cp .env.example .env
   # Then edit the .env file with your settings
   ```

4. **Set up the Database:**

   ```bash
   cd pwd-manager-backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the Development Servers:**

   Backend:

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
