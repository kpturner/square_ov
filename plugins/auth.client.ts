export default defineNuxtPlugin((app) => {
  const authenticated = ref(localStorage.getItem('authenticated') === 'true');

  async function authenticate(password: string) {
    const { authenticated: ok } = await $fetch('/api/auth', {
      method: 'POST',
      body: { password },
    });
    localStorage.setItem('authenticated', ok ? 'true' : 'false');
    authenticated.value = ok;
  }
  return {
    provide: {
      authenticated,
      authenticate,
    },
  };
});
