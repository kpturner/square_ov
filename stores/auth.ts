import { defineStore } from 'pinia';
import type { AuthUser } from '~/types/user';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setUser(user: AuthUser) {
      this.user = user;
    },

    setToken(token: string) {
      this.token = token;
    },

    logout() {
      this.user = null;
      this.token = null;
    },
  },
});
