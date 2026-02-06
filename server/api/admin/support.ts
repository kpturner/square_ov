import prisma from '~/server/utils/dbClient';
import sendEmail from '~/server/utils/brevo';

export default defineEventHandler(async (event) => {
  const { email, subject, question } = await readBody<{
    email: string;
    subject: string;
    question: string;
  }>(event);

  if (!email || !subject || !question)
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, subject and question are required',
    });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'No user found for this email address' });
  }

  const { admins } = useRuntimeConfig().public;
  const to = admins.map((a) => {
    return {
      email: a,
      name: 'Admin',
    };
  });

  await sendEmail('support', to, 'Support Request', {
    USER: user,
    SUBJECT: subject,
    QUESTION: question.split('\n'),
    YEAR: new Date().getFullYear(),
  });

  return { status: 200 };
});
