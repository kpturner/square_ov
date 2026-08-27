export function formatDate(dateStr?: string | Date | undefined | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}
