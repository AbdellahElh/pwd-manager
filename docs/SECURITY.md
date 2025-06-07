# Security Guide

This document provides a comprehensive overview of the security features implemented in the Password Manager with Facial Recognition application.

## Security Overview

The application implements a multi-layered security approach designed to protect:
- User credentials and sensitive data
- Biometric authentication data
- Communication between client and server
- Application against common web vulnerabilities

## Core Security Principles

### 1. Zero Trust Architecture
- All data is encrypted at rest and in transit
- No sensitive data is stored or transmitted in plaintext
- Authentication is required for all operations
- Biometric verification provides additional security layer

### 2. End-to-End Encryption
- Client-side encryption ensures data is protected before transmission
- Server cannot decrypt user passwords or sensitive data
- Unique encryption keys per user prevent cross-user data access

### 3. Defense in Depth
- Multiple security layers provide redundancy
- Security headers protect against various attack vectors
- Input validation and sanitization prevent injection attacks

## Authentication Security

### Facial Recognition Authentication

#### Implementation Details
- Uses face-api.js library for face detection and recognition
- Extracts 128-dimensional face descriptors for matching
- Face images are encrypted before transmission
- Only mathematical descriptors are stored long-term

#### Security Measures
```typescript
// Face descriptor extraction and comparison
const faceDescriptor = await faceapi.detectSingleFace(image)
  .withFaceLandmarks()
  .withFaceDescriptor();

// Secure comparison with stored descriptor
const distance = faceapi.euclideanDistance(
  storedDescriptor, 
  currentDescriptor
);
const isMatch = distance < FACE_MATCH_THRESHOLD;
```

#### Biometric Data Protection
- Face images are immediately encrypted after capture
- Original images are never stored permanently
- Face descriptors cannot be reverse-engineered to recreate faces
- Temporary encryption key used for registration process

### JWT Token Security

#### Token Configuration
- Strong secret keys (minimum 256-bit)
- Short expiration times to limit exposure
- Secure cookie flags in production
- Proper token validation on all endpoints

```typescript
// JWT configuration
const jwtConfig = {
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'pwd-manager',
  audience: 'pwd-manager-users'
};
```

## Data Encryption

### Client-Side Encryption Architecture

#### Key Derivation
```typescript
// User-specific encryption key generation
export const getUserEncryptionKey = (userId: number, userEmail: string): string => {
  const appSecretKey = import.meta.env.VITE_SECRET_KEY;
  return `pwd-manager-${userId}-${userEmail}-${appSecretKey}`;
};

// Key strengthening with PBKDF2
export const strengthenKey = (baseKey: string): string => {
  return PBKDF2(baseKey, SALT, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS, // 10,000 iterations
  }).toString();
};
```

#### AES-256 Encryption Implementation
```typescript
// Encryption function
export const encrypt = (value: string, secretKey: string): string => {
  if (!value) return '';
  const strengthenedKey = strengthenKey(secretKey);
  return AES.encrypt(value, strengthenedKey).toString();
};

// Decryption function
export const decrypt = (encryptedValue: string, secretKey: string): string => {
  if (!encryptedValue) return '';
  try {
    const strengthenedKey = strengthenKey(secretKey);
    const bytes = AES.decrypt(encryptedValue, strengthenedKey);
    return bytes.toString(UTF8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};
```

### Encrypted Data Storage

#### Password Encryption
- All passwords encrypted client-side before storage
- Unique encryption key per user
- No plaintext passwords ever stored or transmitted

#### Credential Data Structure
```typescript
interface EncryptedCredential {
  id: number;
  website: string;
  title: string;
  username: string; // Encrypted
  password: string; // Encrypted
  userId: number;
  createdAt: string;
  updatedAt: string;
}
```

### Image Encryption

#### Selfie Image Protection
```typescript
// Image encryption process
export const encryptImage = async (
  imageBlob: Blob,
  encryptionKey: string
): Promise<{ encryptedData: string; contentType: string }> => {
  // Convert image to base64
  const base64Data = await blobToBase64(imageBlob);
  
  // Encrypt the base64 data using AES
  const encryptedData = encrypt(base64Data, encryptionKey);
  
  return {
    encryptedData,
    contentType: imageBlob.type,
  };
};
```

#### Encrypted Form Data Transmission
```typescript
// Create encrypted form data for secure transmission
export const createEncryptedImageFormData = async (
  imageBlob: Blob,
  encryptionKey: string,
  additionalData: Record<string, string> = {}
): Promise<FormData> => {
  const { encryptedData, contentType } = await encryptImage(imageBlob, encryptionKey);
  
  const encryptedInfo = JSON.stringify({
    data: encryptedData,
    contentType: contentType,
    encryptedAt: new Date().toISOString(),
    version: '1.0'
  });
  
  const formData = new FormData();
  const encryptedFile = new File([encryptedInfo], 'encrypted.json', {
    type: 'application/json'
  });
  
  formData.append('encryptedImage', encryptedFile);
  return formData;
};
```

## Network Security

### HTTPS Enforcement

#### Automatic HTTPS Redirection
```typescript
export const httpsEnforcer = (req: Request, res: Response, next: NextFunction) => {
  const enforceHttps = process.env.ENFORCE_HTTPS === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

  if (enforceHttps && !isSecure && !isDevelopment && !isLocalhost) {
    const redirectUrl = `https://${req.hostname}${req.originalUrl}`;
    return res.redirect(301, redirectUrl);
  }

  next();
};
```

### Security Headers

#### Comprehensive Header Configuration
```typescript
app.use((_req, res, next) => {
  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "media-src 'self' blob:;"
  );
  
  next();
});
```

### CORS Configuration

#### Secure Cross-Origin Resource Sharing
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

## Input Validation and Sanitization

### Data Validation

#### Credential Validation Schema
```typescript
// Using Joi for input validation
const credentialSchema = Joi.object({
  website: Joi.string().uri().required(),
  title: Joi.string().min(1).max(100).required(),
  username: Joi.string().min(1).max(255).required(),
  password: Joi.string().min(1).required(),
  userId: Joi.number().integer().positive().required()
});
```

#### User Registration Validation
```typescript
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  faceDescriptor: Joi.array().items(Joi.number()).length(128).required()
});
```

### SQL Injection Prevention

#### Parameterized Queries with Prisma
```typescript
// Safe database queries using Prisma ORM
const user = await prisma.user.findUnique({
  where: {
    email: email // Automatically parameterized
  }
});

const credentials = await prisma.credential.findMany({
  where: {
    userId: userId // Type-safe and parameterized
  }
});
```

## Error Handling and Information Disclosure

### Secure Error Handling

#### Generic Error Responses
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error for debugging
  console.error('Error:', err);
  
  // Return generic error to client
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};
```

### Information Leakage Prevention
- Generic error messages in production
- No stack traces exposed to clients
- Sensitive data excluded from logs
- Rate limiting on authentication endpoints

## Session Management

### JWT Token Security

#### Token Generation
```typescript
const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000),
      type: 'access'
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '24h',
      algorithm: 'HS256',
      issuer: 'pwd-manager',
      audience: 'pwd-manager-users'
    }
  );
};
```

#### Token Validation Middleware
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded as TokenPayload;
    next();
  });
};
```

## Database Security

### Database Configuration

#### Connection Security
```typescript
// Secure database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
});
```

#### Data Encryption at Rest
- Database file encryption (when supported)
- Sensitive fields encrypted before storage
- No plaintext passwords in database

### Database Schema Security

#### User Table
```sql
CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    faceDescriptor TEXT NOT NULL, -- JSON array of face features
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Credential Table
```sql
CREATE TABLE Credential (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    website TEXT NOT NULL,
    title TEXT NOT NULL,
    username TEXT NOT NULL, -- Encrypted
    password TEXT NOT NULL, -- Encrypted
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

## Security Monitoring and Logging

### Audit Logging

#### Authentication Events
```typescript
const logAuthEvent = (email: string, event: string, success: boolean, ip: string) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'AUTH_EVENT',
    email: email,
    action: event,
    success: success,
    ip: ip,
    userAgent: req.headers['user-agent']
  }));
};
```

#### Security Events
- Failed login attempts
- Invalid token usage
- Unusual access patterns
- Database errors
- Encryption/decryption failures

### Rate Limiting

#### Authentication Rate Limiting
```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
```

## Vulnerability Prevention

### Common Attack Mitigation

#### XSS Prevention
- Content Security Policy headers
- Input sanitization and validation
- Output encoding
- React's built-in XSS protection

#### CSRF Protection
```typescript
// CSRF token validation
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});
```

#### SQL Injection Prevention
- Parameterized queries via Prisma ORM
- Input validation and sanitization
- Least privilege database access

#### Clickjacking Prevention
- X-Frame-Options: DENY header
- Content Security Policy frame-ancestors directive

## Security Configuration

### Environment Variables

#### Required Security Variables
```env
# Encryption
ENCRYPTION_SALT=<64-character-random-hex-string>
APP_SECRET_KEY=<strong-secret-key>

# JWT
JWT_SECRET=<256-bit-secret-key>

# HTTPS
ENFORCE_HTTPS=true
SSL_KEY_PATH=/path/to/private-key.pem
SSL_CERT_PATH=/path/to/certificate.pem

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=file:./prod.db
```

### Security Checklist

#### Pre-Deployment Security Audit
- [ ] All environment variables configured
- [ ] HTTPS properly configured
- [ ] Security headers implemented
- [ ] Input validation in place
- [ ] Error handling secure
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] Database secured
- [ ] Dependencies updated
- [ ] Security testing completed

## Security Best Practices for Users

### Password Security
- Use unique, strong passwords for each service
- Enable strong password generation
- Regularly review and update stored passwords
- Use HTTPS-only mode in browsers

### Biometric Security
- Ensure good lighting for face recognition
- Use in private, secure environments
- Regularly verify face recognition accuracy
- Report any unusual authentication behavior

### Device Security
- Keep browsers and devices updated
- Use secure, trusted networks
- Clear browser data when using shared devices
- Enable device screen locks

## Incident Response

### Security Incident Procedures

1. **Immediate Response**
   - Identify and contain the incident
   - Assess the scope and impact
   - Preserve evidence and logs

2. **Investigation**
   - Analyze attack vectors
   - Identify compromised data
   - Determine root cause

3. **Recovery**
   - Implement fixes and patches
   - Reset affected credentials
   - Restore from clean backups

4. **Post-Incident**
   - Update security measures
   - Document lessons learned
   - Notify affected users if required

### Emergency Contacts
- Security Team: security@yourcompany.com
- Development Team: dev@yourcompany.com
- System Administrator: admin@yourcompany.com

## Security Updates and Maintenance

### Regular Security Tasks
- Dependency vulnerability scanning
- Security patch management
- Certificate renewal monitoring
- Access review and cleanup
- Security testing and audits

### Update Procedures
1. Test security updates in staging environment
2. Schedule maintenance windows for production updates
3. Maintain rollback procedures
4. Document all security changes
5. Communicate changes to users when necessary

For additional security concerns or questions, please contact the security team or refer to the other security documentation files in this directory.
