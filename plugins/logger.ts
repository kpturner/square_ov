import pino from 'pino';

export default defineNuxtPlugin(() => {
  const { logLevel } = useRuntimeConfig().public;

  const logger = pino({
    level: logLevel,
  });

  return {
    provide: {
      logger,
    },
  };
});
