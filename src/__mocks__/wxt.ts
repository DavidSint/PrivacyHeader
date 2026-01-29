import { vi } from 'vitest';

export const defineBackground = (def: unknown) => def;
export const storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  watch: vi.fn(() => vi.fn()),
};
