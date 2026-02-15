import jwt from 'jsonwebtoken';
import { COOKIE, PUBLIC_ENDPOINTS } from '~/utils/constants';

const DEFAULT_AGE = 60 * 60 * 24 * 30;

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';

  // ✅ Ignore non-API routes (pages, assets, etc.)
  if (!url.startsWith('/api')) return;
  const me = url.startsWith('/api/me');

  // Skip auth for public endpoints
  if (PUBLIC_ENDPOINTS.some((path) => url.startsWith(path))) return;

  const token = getCookie(event, COOKIE);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  try {
    const { sessionSecret } = useRuntimeConfig();
    const payload = jwt.verify(token, sessionSecret!) as {
      userId: number;
      impersonating?: boolean;
    };
    event.context.userId = payload.userId;
    event.context.impersonating = payload.impersonating;
    // Make no changes to cookie for the /api/me route
    if (!me) {
      // If impersonating the expiry should remain at 30 mins
      const maxAge = payload.impersonating ? 60 * 30 : DEFAULT_AGE;
      const expiresIn = payload.impersonating ? '30m' : '30d';
      const newToken = jwt.sign(
        { userId: payload.userId, impersonating: payload.impersonating },
        sessionSecret!,
        { expiresIn }
      );
      setCookie(event, COOKIE, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });
    }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
  }
});
