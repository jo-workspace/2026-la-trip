import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, checkPassword, createAuthToken, isAuthEnabled } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ success: true });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
  }

  const { token, maxAge } = createAuthToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return res;
}
