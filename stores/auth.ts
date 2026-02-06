import { defineStore } from 'pinia';
import type { AuthUser } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setUser(user: AuthUser | null) {
      this.user = user;
    },

    logout() {
      this.user = null;
      // Clear server cookie via endpoint
      useApi()('/api/logout', { method: 'POST' }).catch(() => {});
    },

    /** Fetch current user from server (on app load / refresh) */
    async fetchUser() {
      try {
        const user = await $fetch<AuthUser | null>('/api/me');
        this.user = user;
      } catch {
        this.user = null;
      }
    },
  },
});
