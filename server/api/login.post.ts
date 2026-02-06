import prisma from '~/server/utils/dbClient';
import type { AuthUser } from '~/types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { COOKIE } from '~/utils/constants';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event);

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  let valid = false;

  // Check if passwordHash looks like a bcrypt hash (starts with $2)
  if (user.passwordHash?.startsWith('$2')) {
    // Normal bcrypt comparison for hashed passwords
    valid = await bcrypt.compare(body.password, user.passwordHash);
  } else {
    // Plain-text legacy password
    valid = body.password === user.passwordHash;

    if (valid) {
      // Hash password and update for future use
      const newHash = await bcrypt.hash(body.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }
  }

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  const { sessionSecret } = useRuntimeConfig();
  const token = jwt.sign({ userId: user.id }, sessionSecret!, { expiresIn: '30d' });

  setCookie(event, COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  const { passwordHash, passwordResetToken, passwordResetExpires, createdAt, ...userData } = user;

  const authUser: AuthUser = {
    ...userData,
  };

  return { success: true, authUser };
});
