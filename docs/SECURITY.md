# Security Guide

Comprehensive security implementation overview for the Password Manager with Facial Recognition.

## Security Architecture

### Core Principles

- **Zero Trust**: All data encrypted, authentication required
- **End-to-End Encryption**: Client-side encryption before transmission
- **Defense in Depth**: Multiple security layers and protections
- **Privacy First**: Minimal data collection and storage

## Authentication Security

### Facial Recognition

```typescript
// Face descriptor extraction
const faceDescriptor = await faceapi
  .detectSingleFace(image)
  .withFaceLandmarks()
  .withFaceDescriptor();

// Secure comparison
const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);
const isMatch = distance <= FACE_MATCH_THRESHOLD;
```

**Security Features:**

- 128-dimensional mathematical descriptors (no raw images stored)
- AES-256 encryption for biometric data
- Adjustable matching threshold for accuracy vs security
- Client-side processing prevents data exposure

### JWT Authentication

```typescript
// Token generation with security claims
const token = jwt.sign({ userId, email, iat: Date.now() }, process.env.JWT_SECRET, {
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'pwd-manager',
});
```

**Security Features:**

- HMAC-SHA256 signing algorithm
- 24-hour token expiration
- Secure secret key management
- Token validation middleware

## Data Encryption

### Client-Side Encryption

```typescript
// Password encryption before transmission
export const encryptPassword = (password: string, userKey: string): string => {
  const salt = CryptoJS.lib.WordArray.random(256 / 8);
  const key = CryptoJS.PBKDF2(userKey, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return CryptoJS.AES.encrypt(password, key).toString();
};
```

**Encryption Details:**

- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with 10,000 iterations
- **Salt**: Random 256-bit salt per encryption
- **Key Generation**: User-specific keys from email + user ID

### Database Security

```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  faceDescriptor  String?   // Encrypted biometric data
  createdAt       DateTime  @default(now())
  passwords       Password[]
}

model Password {
  id       Int    @id @default(autoincrement())
  title    String
  username String
  password String  // Always encrypted
  url      String?
  userId   Int
  user     User   @relation(fields: [userId], references: [id])
}
```

## Network Security

### HTTPS Enforcement

```typescript
// HTTPS redirect middleware
export const httpsEnforcer = (req: Request, res: Response, next: NextFunction) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
};
```

### Security Headers

```typescript
// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Input Validation

### API Input Sanitization

```typescript
// User registration validation
const userRegistrationSchema = z.object({
  email: z.string().email().max(255),
  faceDescriptor: z.string().optional(),
});

// Password entry validation
const passwordSchema = z.object({
  title: z.string().min(1).max(100),
  username: z.string().max(255),
  password: z.string().min(1), // Encrypted
  url: z.string().url().optional(),
});
```

### SQL Injection Prevention

- **Prisma ORM**: Parameterized queries by default
- **Type Safety**: TypeScript prevents many injection vectors
- **Input Validation**: Zod schemas validate all inputs

## Vulnerability Protections

### Cross-Site Scripting (XSS)

- Content Security Policy headers
- Input sanitization and validation
- React's built-in XSS protection
- Safe HTML rendering practices

### Cross-Site Request Forgery (CSRF)

- SameSite cookie attributes
- Origin header validation
- JWT tokens instead of cookies
- HTTPS-only in production

### Session Security

```typescript
// Secure session management
const sessionConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};
```

## Data Privacy

### Minimal Data Collection

- Only essential user data stored (email, encrypted passwords)
- No tracking or analytics data collection
- Face images processed but never stored
- Optional URL fields for password entries

### User Data Control

- Users can delete accounts and all associated data
- Password entries can be individually deleted
- Biometric data can be removed independently
- Export functionality for data portability

## Security Monitoring

### Error Handling

```typescript
// Secure error responses
export const errorHandler = (err: Error, req: Request, res: Response) => {
  console.error('Security Event:', {
    error: err.message,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Generic error response (no sensitive info leaked)
  res.status(500).json({
    error: 'Internal server error',
    requestId: generateRequestId(),
  });
};
```

### Audit Logging

- Failed authentication attempts logged
- Database operations tracked
- Security policy violations recorded
- Performance metrics monitored

## Security Best Practices

### Development

- Regular dependency security audits (`npm audit`)
- Environment variable management
- Secure coding practices enforcement
- Code review requirements for security changes

### Deployment

- HTTPS certificate configuration
- Environment-specific security settings
- Database access restrictions
- Regular security updates

### Maintenance

- Regular password policy reviews
- Security vulnerability assessments
- Backup and recovery procedures
- Incident response planning

See [HTTPS_SETUP.md](./HTTPS_SETUP.md) for SSL/TLS configuration details.
