import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => {
  const secret =
    process.env.JWT_SECRET || 'topholdings-default-secret-change-in-prod-2024';
  return new TextEncoder().encode(secret);
};

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.AUTH_USERNAME || 'mwhitney';
  const validPassword = process.env.AUTH_PASSWORD || '115Manomet';
  return username === validUsername && password === validPassword;
}
