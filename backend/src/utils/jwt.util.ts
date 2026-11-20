import jwt from 'jsonwebtoken';

// No default value: a secret written in the code would let anyone forge a valid token
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined: add it to backend/.env');
  }
  return secret;
};

// Read when the server starts: it refuses to start without a secret
const JWT_SECRET = getJwtSecret();

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
