// middleware/auth.ts
import type { AuthUser } from '~/types';

export default defineNuxtRouteMiddleware(async (to) => {
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

  const user = await $fetch<AuthUser>('/api/me', {
    headers,
    credentials: 'include',
  }).catch(() => null);

  if (!user) {
    // Allow public pages
    if (PUBLIC_PAGES.includes(to.path)) return;
    // Otherise login
    return navigateTo('/login');
  } else {
    if (ADMIN_PAGES.includes(to.path)) {
      const { admins } = useRuntimeConfig().public;
      if (!admins.includes(user.email)) {
        return navigateTo('/home');
      }
    } else {
      // The index page can redirect to home if we have an authenticated user
      if (to.path === '/') return navigateTo('/home');
    }
  }
  return;
});
