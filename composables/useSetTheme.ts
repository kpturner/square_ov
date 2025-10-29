import { useTheme } from 'vuetify';

export function useSetTheme() {
  const theme = useTheme();

  function toggleTheme() {
    theme.change(theme.global.current.value.dark ? 'light' : 'dark');
    localStorage.setItem('theme', theme.global.name.value);
  }

  onMounted(async () => {
    const saved = localStorage.getItem('theme');
    if (saved) theme.change(saved);
  });

  watch(
    () => theme.global.name.value,
    (val) => {
      localStorage.setItem('theme', val);
    }
  );

  return { theme, toggleTheme };
}
