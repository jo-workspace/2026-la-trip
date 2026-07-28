import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'hub_auth';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 天

// 未設定 APP_PASSWORD 時視為不啟用密碼保護（例如本地開發）
export function isAuthEnabled(): boolean {
  return !!process.env.APP_PASSWORD;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD || '';
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sign(value: string): string {
  return crypto.createHmac('sha256', process.env.APP_PASSWORD as string).update(value).digest('hex');
}

export function createAuthToken(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const expiresAtStr = String(expiresAt);
  return { token: `${expiresAtStr}.${sign(expiresAtStr)}`, maxAge: COOKIE_MAX_AGE_SECONDS };
}

export function verifyAuthToken(token: string | undefined | null): boolean {
  if (!isAuthEnabled()) return true;
  if (!token) return false;

  const [expiresAtStr, signature] = token.split('.');
  if (!expiresAtStr || !signature) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSig = sign(expiresAtStr);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
