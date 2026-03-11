// Logging
export const log = (...args) => console.log('[Chatsy:widget]', ...args);
export const logWarn = (...args) => console.warn('[Chatsy:widget]', ...args);
export const logError = (...args) => console.error('[Chatsy:widget]', ...args);

// Deep merge utility
export function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
      && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
