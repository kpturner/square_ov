import prisma from '~/server/utils/dbClient';
import sendEmail from '~/server/utils/brevo';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const { email } = await readBody<{ email: string }>(event);

  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal that the email doesn't exist
    return { success: true };
  }

  // Generate a token
  const token = crypto.randomUUID();
  const tokenHash = await bcrypt.hash(token, 10);

  // Store hashed token and expiry (1 hour)
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: tokenHash,
      passwordResetExpires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  const { appUrl } = useRuntimeConfig();
  const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  logger.debug(`Send password reset link to ${email}: ${resetUrl}`);

  await sendEmail('passwordReset', [{ email, name: user.name }], 'Reset Your Square OV Password', {
    NAME: user.name,
    RESET_URL: resetUrl,
    YEAR: new Date().getFullYear(),
  });

  return { success: true };
});
