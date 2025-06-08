# Face Password Manager - Frontend

[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

The React frontend for the Password Manager with Facial Recognition application. This package provides a modern, responsive web interface with biometric authentication capabilities.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🔧 Prerequisites](#-prerequisites)
- [⚡ Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [🛡️ Security Considerations](#️-security-considerations)
- [🚀 Development](#-development)
- [🔗 API Integration](#-api-integration)
- [📚 Documentation](#-documentation)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

## ✨ Features

### 🎯 Core Functionality

- **Facial Recognition Authentication**: Secure biometric login using advanced face detection
- **Password Management**: Add, view, edit, and delete encrypted password entries
- **Real-time Synchronization**: Instant updates with the backend API
- **Responsive Design**: Optimized for desktop and mobile devices

### 🔒 Security Features

- **Client-Side Encryption**: Passwords encrypted before transmission using AES-256-GCM
- **Biometric Security**: Face descriptors processed locally for privacy protection
- **Secure Communication**: HTTPS-only API communication in production
- **Session Management**: JWT-based authentication with automatic token refresh

### 🎨 User Experience

- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Dark/Light Mode**: Adaptive theme support for user preference
- **Accessibility**: WCAG 2.1 AA compliant design
- **Fast Performance**: Optimized with Vite bundling and code splitting

## 🔧 Prerequisites

- **Node.js**: Version 18.0 or higher
- **Modern Browser**: Chrome 88+, Firefox 85+, Safari 14+, or Edge 88+
- **Webcam**: Required for facial recognition authentication
- **HTTPS Environment**: Required for webcam access (or localhost for development)

## ⚡ Quick Start

### From Monorepo Root

```bash
# Install all dependencies
npm run install:all

# Start development server (includes backend)
npm run dev

# Frontend will be available at http://localhost:5173
```

### Package-Specific Development

```bash
# Navigate to frontend package
cd packages/face-pwd-manager-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the package root:

```env
# Backend API Configuration
VITE_BACKEND_URL="http://localhost:3000/api"

# Encryption Configuration (must match backend)
VITE_SECRET_KEY="your-app-secret-key-here"
VITE_ENCRYPTION_SALT="your-32-char-hex-salt-here"

# Development Settings
VITE_NODE_ENV="development"
VITE_DEBUG_MODE="false"
```

### Face Recognition Models

The required TensorFlow.js models are included in the `public/models/` directory:

```
public/models/
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_recognition_model-shard2
├── ssd_mobilenetv1_model-weights_manifest.json
├── ssd_mobilenetv1_model-shard1
├── ssd_mobilenetv1_model-shard2
├── face_landmark_68_model-weights_manifest.json
└── face_landmark_68_model-shard1
```

**Note**: These models are automatically loaded when the application starts.

## 🛡️ Security Considerations

### Encryption Implementation

- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Key Generation**: 100,000 iterations for password-based key derivation
- **Salt Management**: Unique salts for each encryption operation
- **Data Protection**: Passwords never stored or transmitted in plaintext

### Biometric Data Protection

- **Local Processing**: Face descriptors generated and stored locally
- **No Raw Images**: Facial images never stored or transmitted
- **Template Protection**: Face descriptors encrypted before database storage
- **Privacy First**: Biometric data remains on user's device when possible

### Network Security

- **API Communication**: All API calls use secure HTTPS in production
- **Token Management**: JWT tokens stored securely with HttpOnly cookies
- **CORS Protection**: Configured for authorized domains only
- **Input Validation**: All user inputs sanitized and validated

For comprehensive security details, see [Security Documentation](../../docs/SECURITY.md).

## 🚀 Development

### Available Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server with hot reload |
| `npm run build`      | Build for production                     |
| `npm run preview`    | Preview production build locally         |
| `npm run lint`       | Run ESLint for code quality              |
| `npm run format`     | Format code with Prettier                |
| `npm run type-check` | Run TypeScript type checking             |

### Development Workflow

1. **Component Development**:

   ```bash
   npm run dev
   # Edit components in src/components/
   # Changes automatically reload in browser
   ```

2. **State Management**:

   ```bash
   # Global state managed with React Context
   # See src/context/ for state providers
   ```

3. **API Integration**:
   ```bash
   # API services in src/services/
   # Axios-based HTTP client with interceptors
   ```

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components
│   └── password/        # Password management components
├── context/             # React Context providers
├── services/            # API and external service integrations
├── utils/               # Utility functions and helpers
├── pages/               # Page components and routing
├── models/              # TypeScript type definitions
└── data/               # Static data and constants
```

## 🔗 API Integration

### Backend Communication

The frontend communicates with the Express.js backend through a RESTful API:

- **Base URL**: `http://localhost:3000/api` (development)
- **Authentication**: JWT tokens in Authorization headers
- **Data Format**: JSON request/response bodies
- **Error Handling**: Consistent error response structure

### Key API Endpoints

- `POST /auth/register` - User registration with face data
- `POST /auth/login` - Facial recognition authentication
- `GET /credentials` - Retrieve encrypted password entries
- `POST /credentials` - Add new password entry
- `PUT /credentials/:id` - Update existing entry
- `DELETE /credentials/:id` - Delete password entry

For complete API documentation, see [Backend README](../face-pwd-manager-backend/README.md).

## 📚 Documentation

### Related Documentation

- [Main Project README](../../README.md) - Project overview and setup
- [Backend Documentation](../face-pwd-manager-backend/README.md) - API server details
- [Security Guide](../../docs/SECURITY.md) - Comprehensive security documentation
- [Encryption Details](../../docs/ENCRYPTION.md) - Technical encryption implementation
- [Face Recognition Security](../../docs/FACE_ENCRYPTION.md) - Biometric data protection
- [HTTPS Setup](../../docs/HTTPS_SETUP.md) - SSL/TLS configuration
- [Implementation Guide](../../docs/IMPLEMENTATION.md) - Technical implementation details
- [Monorepo Workflow](../../docs/MONOREPO_WORKFLOW.md) - Development processes

### Technical References

- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js) - Face recognition library
- [React Documentation](https://reactjs.org/docs) - React framework
- [Vite Documentation](https://vitejs.dev/guide/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/docs) - CSS framework

## 🐛 Troubleshooting

### Common Issues

**Webcam Access Denied**

```bash
# Solution: Ensure HTTPS is enabled or use localhost
# Check browser permissions for camera access
# Verify getUserMedia API support
```

**Face Recognition Models Not Loading**

```bash
# Check network connectivity
# Verify models exist in public/models/ directory
# Check browser console for loading errors
```

**API Connection Issues**

```bash
# Verify backend server is running on correct port
# Check VITE_BACKEND_URL environment variable
# Confirm CORS settings allow frontend domain
```

**Build Failures**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run build --force
```

### Performance Optimization

1. **Bundle Size**: Use `npm run build` and check bundle analyzer
2. **Face Model Loading**: Models are cached after first load
3. **Image Processing**: Face detection optimized for performance
4. **Memory Management**: Components properly clean up resources

### Browser Compatibility

| Browser | Minimum Version | Face Recognition | Webcam Support |
| ------- | --------------- | ---------------- | -------------- |
| Chrome  | 88+             | ✅               | ✅             |
| Firefox | 85+             | ✅               | ✅             |
| Safari  | 14+             | ✅               | ✅             |
| Edge    | 88+             | ✅               | ✅             |

## 🤝 Contributing

Please see the [main project README](../../README.md) for contribution guidelines.

### Frontend-Specific Guidelines

1. Follow React best practices and hooks patterns
2. Use TypeScript for all new components
3. Follow the established component structure
4. Add proper error boundaries for robustness
5. Ensure accessibility compliance (WCAG 2.1 AA)
6. Write unit tests for complex logic
7. Document complex algorithms and business logic

---

**⚠️ Security Notice**: This frontend handles sensitive biometric and credential data. Always verify security configurations before deploying to production.

**💡 Need Help?** Check the troubleshooting section above or refer to the comprehensive documentation in the `/docs` directory.

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
