# HTTPS Setup Guide

Complete SSL/TLS configuration guide for secure password manager deployment.

## Why HTTPS is Required

- **Camera Access**: Face recognition requires secure contexts
- **Data Protection**: Encrypts sensitive password transmission
- **Browser Requirements**: Modern browsers enforce HTTPS for getUserMedia API
- **Security**: Prevents man-in-the-middle attacks

## Development Environment

### Local HTTPS Setup

```bash
# Generate self-signed certificates
mkdir certs && cd certs
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

### Backend HTTPS Configuration

```typescript
// server.ts - HTTPS support
import https from 'https';
import fs from 'fs';

const app = express();

if (process.env.NODE_ENV === 'development' && process.env.USE_HTTPS === 'true') {
  const httpsOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
  };

  https.createServer(httpsOptions, app).listen(3000, () => {
    console.log('HTTPS Server running on https://localhost:3000');
  });
} else {
  app.listen(3000, () => {
    console.log('HTTP Server running on http://localhost:3000');
  });
}
```

### Frontend HTTPS Configuration

```typescript
// vite.config.ts - Development HTTPS
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    https:
      process.env.USE_HTTPS === 'true'
        ? {
            key: fs.readFileSync('./certs/key.pem'),
            cert: fs.readFileSync('./certs/cert.pem'),
          }
        : false,
    host: 'localhost',
    port: 5173,
  },
});
```

### Environment Configuration

```bash
# .env.development
USE_HTTPS=true
VITE_API_URL=https://localhost:3000
NODE_ENV=development
```

## Production Environment

### SSL Certificate Options

#### 1. Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2. Commercial SSL Certificate

- Purchase from Certificate Authority (CA)
- Validate domain ownership
- Install certificate files on server

### Production Server Configuration

#### Express.js with SSL

```typescript
// Production HTTPS server
import express from 'express';
import https from 'https';
import fs from 'fs';

const app = express();

// HTTPS redirect middleware
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

if (process.env.NODE_ENV === 'production') {
  const httpsOptions = {
    key: fs.readFileSync('/path/to/private-key.pem'),
    cert: fs.readFileSync('/path/to/certificate.pem'),
    ca: fs.readFileSync('/path/to/ca-bundle.pem'), // If using CA bundle
  };

  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('Production HTTPS server running on port 443');
  });

  // HTTP to HTTPS redirect server
  express()
    .use((req, res) => {
      res.redirect(`https://${req.header('host')}${req.url}`);
    })
    .listen(80);
}
```

#### Nginx Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/pwd-manager
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Frontend (React)
    location / {
        root /var/www/pwd-manager/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Docker HTTPS Setup

### Dockerfile with SSL Support

```dockerfile
# Production Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy certificates (in production, mount as volumes)
COPY certs/ ./certs/

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY dist/ ./dist/

EXPOSE 443 80

CMD ["node", "dist/server.js"]
```

### Docker Compose with SSL

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  pwd-manager:
    build: .
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /etc/letsencrypt/live/yourdomain.com:/app/certs:ro
    environment:
      - NODE_ENV=production
      - SSL_CERT_PATH=/app/certs/fullchain.pem
      - SSL_KEY_PATH=/app/certs/privkey.pem
```

## SSL Testing and Validation

### Certificate Verification

```bash
# Check certificate validity
openssl x509 -in certificate.pem -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### SSL Labs Test

Visit [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/) to analyze your SSL configuration and get an A+ rating.

## Troubleshooting

### Common Issues

- **Mixed Content**: Ensure all resources load over HTTPS
- **Certificate Errors**: Verify certificate chain and domain match
- **Browser Warnings**: Accept self-signed certificates in development
- **API Calls**: Update all API endpoints to use HTTPS URLs

### Development Tips

```bash
# Trust self-signed certificate (Chrome)
chrome --ignore-certificate-errors --ignore-ssl-errors --allow-running-insecure-content

# Firefox: Navigate to about:config and set security.tls.insecure_fallback_hosts
```

## Security Best Practices

- Use TLS 1.2 or higher
- Implement HTTP Strict Transport Security (HSTS)
- Regular certificate renewal automation
- Monitor certificate expiration dates
- Use strong cipher suites
- Implement Certificate Transparency monitoring

See [SECURITY.md](./SECURITY.md) for comprehensive security implementation details.
