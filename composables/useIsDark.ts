import { useTheme } from 'vuetify';

export function useIsDark() {
  const { isReady } = useSetTheme();
  const theme = useTheme();
  const isDark = computed(() => isReady.value && theme.global.name.value === 'dark');

  return { theme, isDark };
}
