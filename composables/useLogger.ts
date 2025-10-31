// Logs will be produced based on the required logging level.
// Developers can code logs with an appropriate level (category) but they
// will only appear based on the logging level set. Levels are:

// Level              Logs shown
// =====              ==========
// TRACE              trace, debug, info, warn, error
// DEBUG              debug, info, warn, error
// INFO               info, warn, error
// WARN               warn, error
// ERROR              error
// SILENT             nothing

// The optional namespace will allow the viewer to distinguish logs from different
// components.
//
// Developers can override logging levels for any namespace by creating a localStorage
// value with a key of "loglevel:<namespace>" and a value matching one of the above values.
// For example "loglevel:default" with value "SILENT" (must be uppercase). This will override
// the default logging level.

import log from 'loglevel';
import type { LogLevelDesc, Logger } from 'loglevel';

const wrappedLoggers = new Map();

export default function useLogger(namespace = 'default') {
  const logLevel: LogLevelDesc = useRuntimeConfig().public.logLevel as LogLevelDesc;

  if (wrappedLoggers.has(namespace)) {
    return wrappedLoggers.get(namespace);
  }

  const logger = log.getLogger(namespace);

  const defaultLevel = logLevel ?? (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

  const localStorageKey = `loglevel:${namespace}`;
  const localOverride = localStorage.getItem(localStorageKey);
  const hasLocalOverride = localOverride && localOverride.toLowerCase() !== defaultLevel;

  if (!hasLocalOverride) {
    logger.setLevel(defaultLevel);
  }

  const prefix = namespace === 'default' ? '' : `[${namespace}]`;
  const wrappedLogger = Object.create(logger);

  const methods: (keyof Logger)[] = ['trace', 'debug', 'info', 'warn', 'error'];

  methods.forEach((method) => {
    const original = logger[method] as (...args: unknown[]) => void;
    wrappedLogger[method] = (...args: unknown[]) => {
      if (typeof args[0] === 'string') {
        original(`${prefix} ${args[0]}`, ...args.slice(1));
      } else {
        original(prefix, ...args);
      }
    };
  });

  wrappedLoggers.set(namespace, wrappedLogger);
  return wrappedLogger;
}
