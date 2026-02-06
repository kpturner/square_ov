import type { FetchOptions } from 'ofetch';

// Define the method literal type
type ApiMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete';

// Define the options type for our wrapper
type ApiFetchOptions = Omit<FetchOptions, 'method'> & {
  method?: ApiMethod;
};

export function useApi() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const rawFetch = $fetch as typeof $fetch.raw;

  async function api<T>(url: string, options?: ApiFetchOptions): Promise<T> {
    try {
      const res = await rawFetch(url, {
        credentials: 'include',
        ...options,
      });

      return res as T;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };

      if (e.response?.status === 401) {
        authStore.setUser(null);
        if (!PUBLIC_ENDPOINTS.includes(url)) {
          useToast()?.('Session expired. Please log in again.');
          if (route.path !== '/login') {
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          }
        }
      }

      throw err;
    }
  }

  return api;
}
