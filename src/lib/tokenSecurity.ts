import crypto from 'crypto';

const SECRET_KEY = process.env.TOKEN_SIGNING_SECRET || 'yenepoya-set-class-track-secret-2024';

/**
 * Generates a signed, single-class, time-bound token
 * Payload contains: classId, sessionTokenId, expiresAt (timestamp)
 */
export function generateSignedSessionToken(classId: string, durationMinutes: number = 5): {
  token: string;
  numericCode: string;
  expiresAt: string;
} {
  const expiresTimestamp = Date.now() + durationMinutes * 60 * 1000;
  const expiresAt = new Date(expiresTimestamp).toISOString();
  
  // Random session identifier
  const nonce = crypto.randomBytes(8).toString('hex');
  
  // 6-digit numeric fallback code (e.g. 100000 - 999999)
  const numericCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Create cryptographic HMAC signature
  const rawData = `${classId}:${numericCode}:${expiresTimestamp}:${nonce}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(rawData).digest('hex').substring(0, 16);
  
  // Base64URL encoded package
  const tokenPayload = {
    c: classId,
    n: numericCode,
    e: expiresTimestamp,
    s: hmac,
    r: nonce,
  };

  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

  return {
    token,
    numericCode,
    expiresAt,
  };
}

/**
 * Validates a signed QR token or 6-digit code against current server time and expected session
 */
export function verifySessionToken(
  token: string, 
  expectedNumericCode: string, 
  expiresAtIso: string
): { valid: boolean; reason?: string } {
  const now = Date.now();
  const sessionExpiry = new Date(expiresAtIso).getTime();

  // Strict server-side expiry validation
  if (now > sessionExpiry) {
    return { valid: false, reason: 'This attendance session has expired.' };
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    
    // Verify HMAC
    const rawData = `${decoded.c}:${decoded.n}:${decoded.e}:${decoded.r}`;
    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(rawData).digest('hex').substring(0, 16);
    
    if (decoded.s !== expectedHmac) {
      return { valid: false, reason: 'Invalid or tampered attendance token.' };
    }

    if (now > decoded.e) {
      return { valid: false, reason: 'Attendance QR code has timed out.' };
    }

    if (decoded.n !== expectedNumericCode) {
      return { valid: false, reason: 'Session token mismatch.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Malformed QR payload.' };
  }
}

// In-memory rate limiter per IP / student ID
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowSeconds = 60): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { attempts: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true };
  }

  if (record.attempts >= maxAttempts) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  record.attempts += 1;
  return { allowed: true };
}
