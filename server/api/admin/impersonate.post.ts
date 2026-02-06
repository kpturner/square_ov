import prisma from '~/server/utils/dbClient';
import type { AuthUser, ImpersonateResponse } from '~/types';
import jwt from 'jsonwebtoken';
import { COOKIE } from '~/utils/constants';

export default defineEventHandler(async (event): Promise<ImpersonateResponse> => {
  const body = await readBody<{ userId: number }>(event);

  if (!body.userId) {
    throw createError({ statusCode: 400, statusMessage: 'User id is required' });
  }

  const user = await prisma.user.findUnique({ where: { id: body.userId } });

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  const { sessionSecret } = useRuntimeConfig();
  const maxAge = 60 * 30;
  const expiresIn = '30m';
  const token = jwt.sign({ userId: user.id, impersonating: true }, sessionSecret!, {
    expiresIn,
  });

  setCookie(event, COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  const { passwordHash, passwordResetToken, passwordResetExpires, createdAt, ...userData } = user;

  const authUser: AuthUser = {
    ...userData,
  };

  return { success: true, authUser };
});
