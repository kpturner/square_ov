import { useAuthStore } from '~/stores/auth';

export function useIsAdmin() {
  const { admins } = useRuntimeConfig().public;
  const authStore = useAuthStore();
  const isAdmin = computed(() => admins && admins.includes(authStore.user?.email ?? ''));

  return isAdmin;
}
