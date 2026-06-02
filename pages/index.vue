<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.user) {
    navigateTo('/home');
  }
  navigateTo('/login');
});
</script>
