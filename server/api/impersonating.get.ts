export default defineEventHandler(async (event) => {
  const impersonating = event.context.impersonating;
  return impersonating ?? false;
});
