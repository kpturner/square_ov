// server/api/password/reset.post.ts
import prisma from '~/server/utils/dbClient';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email: string;
    token: string;
    newPassword: string;
  }>(event);

  const { email, token, newPassword } = body;

  if (!email || !token || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    !user.passwordResetToken ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < new Date()
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' });
  }

  // Compare token
  const valid = await bcrypt.compare(token, user.passwordResetToken);
  if (!valid) throw createError({ statusCode: 400, statusMessage: 'Invalid or expired token' });

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password and clear token
  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { success: true };
});
