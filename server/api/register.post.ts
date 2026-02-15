import prisma from '~/server/utils/dbClient';
import type { AuthUser } from '~/types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '~/server/utils/brevo';
import { COOKIE } from '~/utils/constants';

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string;
    email: string;
    password: string;
    stripeCustomerId: string;
    masonicYear: string;
  }>(event);

  if (!body.name || !body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'User already exists' });
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (!isValidEmail(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' });
  }

  // Only active officers can register an account
  const ao = await prisma.activeOfficer.findUnique({
    where: { year_email: { year: body.masonicYear, primaryEmail: body.email } },
  });
  if (!ao) {
    throw createError({
      statusCode: 400,
      statusMessage: `Email address ${body.email} is not a primary email address for any active officer in ${body.masonicYear}`,
    });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
    },
  });

  const { sessionSecret } = useRuntimeConfig();
  const token = jwt.sign({ userId: user.id }, sessionSecret!, { expiresIn: '30d' });

  // Set HTTP-only cookie
  setCookie(event, COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  const { passwordHash: removed, passwordResetToken, passwordResetExpires, ...authUserData } = user;

  const authUser: AuthUser = {
    ...authUserData,
  };

  const { admins } = useRuntimeConfig().public;
  const to = admins.map((a) => {
    return {
      email: a,
      name: 'Admin',
    };
  });

  await sendEmail('registration', to, 'New User Registered', {
    USER: authUser,
    YEAR: new Date().getFullYear(),
  });

  return { success: true, authUser };
});
