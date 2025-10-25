import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Read JSON body
  if (!body.password) {
    throw createError({ statusCode: 400, message: 'Password is required' });
  }

  const { password: comparePwd } = useRuntimeConfig();

  const hash = Buffer.from(comparePwd, 'base64').toString('utf-8');

  const authenticated = await bcrypt.compare(body.password, hash);

  return { authenticated };
});
