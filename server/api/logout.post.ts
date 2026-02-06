// server/api/logout.post.ts
export default defineEventHandler((event) => {
  // Clear the auth cookie
  setCookie(event, 'ssquare-ov-auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // expire immediately
    path: '/', // important: match the path used for login
  });

  return { success: true };
});
