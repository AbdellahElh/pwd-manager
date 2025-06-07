# HTTPS Setup Guide

This document provides comprehensive instructions for setting up HTTPS in the Password Manager with Facial Recognition application.

## Overview

HTTPS is crucial for this application because:
- Facial recognition requires secure contexts for camera access
- Sensitive password data must be transmitted securely
- Modern browsers enforce HTTPS for getUserMedia API
- SSL/TLS encryption protects against man-in-the-middle attacks

## Development Environment

### Local Development with HTTPS

For development with HTTPS on localhost:

1. **Generate Self-Signed Certificates:**
   ```bash
   # Create certificates directory
   mkdir certs
   cd certs

   # Generate private key and certificate
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
   ```

2. **Update Backend Configuration:**
   ```typescript
   // In server.ts, add HTTPS support
   import https from 'https';
   import fs from 'fs';

   const app = express();
   
   if (process.env.NODE_ENV === 'development' && process.env.USE_HTTPS === 'true') {
     const httpsOptions = {
       key: fs.readFileSync('./certs/key.pem'),
       cert: fs.readFileSync('./certs/cert.pem')
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

3. **Environment Variables:**
   ```env
   # Backend .env
   NODE_ENV=development
   USE_HTTPS=true
   ENFORCE_HTTPS=false
   ```

   ```env
   # Frontend .env
   VITE_BACKEND_URL=https://localhost:3000/api
   ```

### Browser Certificate Acceptance

When using self-signed certificates:
1. Navigate to `https://localhost:3000` in your browser
2. Accept the security warning (click "Advanced" → "Proceed to localhost")
3. The certificate will be temporarily trusted for the session

## Production Environment

### SSL Certificate Options

#### 1. Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be stored in:
# /etc/letsencrypt/live/yourdomain.com/
```

#### 2. Commercial SSL Certificate

Purchase from providers like:
- DigiCert
- GlobalSign
- Sectigo
- GoDaddy

### Production Server Configuration

#### Node.js/Express HTTPS Server

```typescript
import https from 'https';
import fs from 'fs';
import express from 'express';

const app = express();

// HTTPS configuration
const httpsOptions = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
  // Optional: Certificate chain
  ca: fs.readFileSync('/path/to/ca-bundle.pem')
};

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

// Optional: Redirect HTTP to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(301, `https://${req.headers.host}${req.url}`);
});
httpApp.listen(80);
```

#### Environment Variables

```env
# Production .env
NODE_ENV=production
ENFORCE_HTTPS=true
SSL_KEY_PATH=/path/to/private-key.pem
SSL_CERT_PATH=/path/to/certificate.pem
SSL_CA_PATH=/path/to/ca-bundle.pem
```

### Reverse Proxy Setup

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/yourdomain.com/chain.pem

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## Application Configuration

### HTTPS Enforcement Middleware

The application includes built-in HTTPS enforcement:

```typescript
// middleware/httpsEnforcer.ts
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

The application automatically sets security headers:

```typescript
// Security headers in server.ts
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

## Testing HTTPS Setup

### Verification Checklist

1. **SSL Certificate Validity:**
   ```bash
   # Check certificate details
   openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
   
   # Verify certificate chain
   curl -I https://yourdomain.com
   ```

2. **Security Headers:**
   ```bash
   # Test security headers
   curl -I https://yourdomain.com
   
   # Check for HSTS header
   curl -s -D- https://yourdomain.com | grep -i strict-transport-security
   ```

3. **SSL Labs Test:**
   - Visit: https://www.ssllabs.com/ssltest/
   - Enter your domain for comprehensive SSL analysis
   - Aim for A+ rating

4. **Browser Testing:**
   - Verify green lock icon appears
   - Check certificate details in browser
   - Test camera access functionality

### Common Issues and Solutions

#### 1. Mixed Content Warnings

```javascript
// Ensure all resources use HTTPS
// Bad: http://example.com/script.js
// Good: https://example.com/script.js or //example.com/script.js
```

#### 2. Camera Access Denied

- Ensure site is served over HTTPS
- Check browser permissions
- Verify secure context requirements

#### 3. Certificate Chain Issues

```bash
# Verify certificate chain
openssl verify -CAfile ca-bundle.pem certificate.pem
```

#### 4. Port Binding Issues

```bash
# On Linux, allow non-root to bind to port 443
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
```

## Certificate Renewal

### Let's Encrypt Auto-Renewal

```bash
# Add to crontab for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

### Manual Renewal Process

1. **Backup existing certificates**
2. **Request new certificate**
3. **Update server configuration**
4. **Test configuration**
5. **Restart services**

## Security Best Practices

1. **Use Strong SSL Configuration:**
   - TLS 1.2+ only
   - Strong cipher suites
   - Perfect Forward Secrecy

2. **Implement HSTS:**
   - Set max-age to at least 1 year
   - Include subdomains
   - Consider HSTS preload list

3. **Regular Updates:**
   - Keep SSL/TLS libraries updated
   - Monitor for security advisories
   - Update certificates before expiration

4. **Certificate Transparency:**
   - Monitor CT logs for unauthorized certificates
   - Use Certificate Authority Authorization (CAA) DNS records

## Troubleshooting

### Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in certificate.pem -text -noout | grep "Not After"

# Verify certificate matches private key
openssl x509 -noout -modulus -in certificate.pem | openssl md5
openssl rsa -noout -modulus -in private-key.pem | openssl md5
```

### Connection Issues

1. **Check firewall settings**
2. **Verify DNS resolution**
3. **Test port connectivity**
4. **Review server logs**

For additional support, consult the main project documentation or contact the development team.
