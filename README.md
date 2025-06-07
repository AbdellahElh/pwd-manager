# Password Manager with Facial Recognition

This is a monorepo containing a full-stack password management application with facial recognition authentication.

## Project Structure

```
├── packages/
│   ├── face-pwd-manager-backend/     # Express.js backend API
│   └── face-pwd-manager-frontend/    # React frontend application
```

## Features

- 🔐 Secure password storage with client-side encryption
- 👤 Facial recognition authentication using face-api.js
- 🔄 Real-time synchronization between frontend and backend
- 🛡️ JWT-based authentication
- 📱 Responsive web interface
- 🗄️ SQLite database with Prisma ORM

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma + SQLite
- **Authentication**: JWT + Facial Recognition
- **Encryption**: Client-side AES encryption for passwords

## Security Features

- Passwords are encrypted client-side before storage
- Face descriptors are stored securely in the database
- HTTPS enforcement in production
- CORS protection
- JWT token authentication

## Development

Each package can be developed independently:

- **Backend**: `cd packages/face-pwd-manager-backend && npm run dev`
- **Frontend**: `cd packages/face-pwd-manager-frontend && npm run dev`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License
