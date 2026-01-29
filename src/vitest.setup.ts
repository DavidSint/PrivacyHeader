// Mock WXT global auto-imports
// @ts-expect-error defineBackground is not defined in the test environment
global.defineBackground = (def: unknown) => def;
