import { useTheme } from 'vuetify';

export function useSetTheme() {
  const theme = useTheme();
  const isReady = ref(false); // <-- track when theme is ready

  function toggleTheme() {
    theme.change(theme.global.current.value.dark ? 'light' : 'dark');
    localStorage.setItem('theme', theme.global.name.value);
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme');
    if (saved) theme.change(saved);
    isReady.value = true; // theme has been applied
  });

  watch(
    () => theme.global.name.value,
    (val) => localStorage.setItem('theme', val)
  );

  return { theme, toggleTheme, isReady };
}
