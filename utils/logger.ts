/**
 * utils/logger.ts
 * Lightweight wrapper so test output is easy to read in CI logs.
 */

const timestamp = () => new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm

export const logger = {
  info: (msg: string) => console.log(`  ℹ  [${timestamp()}] ${msg}`),
  step: (msg: string) => console.log(`  ▶  [${timestamp()}] STEP: ${msg}`),
  pass: (msg: string) => console.log(`  ✔  [${timestamp()}] PASS: ${msg}`),
  warn: (msg: string) => console.warn(`  ⚠  [${timestamp()}] WARN: ${msg}`),
  fail: (msg: string) => console.error(`  ✘  [${timestamp()}] FAIL: ${msg}`),
};
