# Implementation Documentation

Complete technical overview of the Password Manager with Facial Recognition implementation.

## Architecture Overview

### System Design

```
React Frontend ←→ Express Backend ←→ SQLite Database
      ↓               ↓                    ↓
  Face-API.js    JWT + Middleware    Prisma ORM
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma ORM + SQLite
- **Security**: JWT authentication + AES-256 encryption + Face recognition
- **Development**: ESLint + Prettier + Jest + Nodemon

## Core Features

### Authentication System

```typescript
// Face recognition service
export class FaceAuthenticationService {
  async initialize(): Promise<void> {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]);
  }

  async extractFaceDescriptor(imageElement: HTMLElement): Promise<Float32Array | null> {
    const detection = await faceapi
      .detectSingleFace(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection?.descriptor || null;
  }
}
```

### Password Management

```typescript
// Encrypted password storage
export class PasswordService {
  static encryptPassword(password: string, key: string): string {
    return CryptoJS.AES.encrypt(password, key).toString();
  }

  static decryptPassword(encrypted: string, key: string): string {
    return CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
  }
}
```

## Database Schema

### User Model

```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  faceDescriptor  String?
  createdAt       DateTime  @default(now())
  passwords       Password[]
}
```

### Password Model

```prisma
model Password {
  id          Int      @id @default(autoincrement())
  title       String
  username    String
  password    String   // Encrypted
  url         String?
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration with face data
- `POST /api/auth/login` - Face-based authentication
- `POST /api/auth/verify` - JWT token verification

### Password Management

- `GET /api/passwords` - Retrieve user passwords
- `POST /api/passwords` - Create new password entry
- `PUT /api/passwords/:id` - Update existing password
- `DELETE /api/passwords/:id` - Delete password entry

## Security Implementation

### Client-Side Encryption

- All passwords encrypted with AES-256 before transmission
- User-specific encryption keys derived from email + user ID
- Face descriptors stored as encrypted arrays

### Server Security

- JWT authentication with 24-hour expiration
- HTTPS enforcement in production
- SQL injection protection via Prisma ORM
- Input validation and sanitization

## Development Workflow

### Monorepo Structure

```
pwd-manager/
├── packages/
│   ├── face-pwd-manager-frontend/
│   └── face-pwd-manager-backend/
├── docs/
└── package.json (workspace root)
```

### Build Process

- TypeScript compilation for type safety
- Vite bundling for optimized frontend builds
- Concurrent development with `npm run dev`
- Shared tooling across packages (ESLint, Prettier)

## Performance Optimizations

### Frontend

- Code splitting with React.lazy()
- Face model loading only when needed
- SWR for efficient data fetching and caching
- Tailwind CSS purging for minimal bundle size

### Backend

- Database indexing on frequently queried fields
- JWT caching to reduce verification overhead
- Gzip compression for API responses
- Connection pooling for database operations

## Deployment Considerations

### Production Setup

- Environment variables for secrets management
- SSL certificate configuration
- Database migration scripts
- Docker containerization support

### Monitoring

- Error logging and tracking
- Performance monitoring
- Security audit logging
- User activity analytics

## Testing Strategy

- Unit tests for core functionality
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Security testing for authentication flows

See [SECURITY.md](./SECURITY.md) for detailed security implementation.
