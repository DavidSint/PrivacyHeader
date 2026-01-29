import { describe, it, expect } from 'vitest';
import { headerSchema, profileSchema, exportSchema } from './validation';

describe('validation schemas', () => {
  describe('headerSchema', () => {
    it('should accept valid header', () => {
      const result = headerSchema.safeParse({
        id: '123',
        name: 'X-Custom-Header',
        value: 'test-value',
      });
      expect(result.success).toBe(true);
    });

    it('should accept header with empty value (for removing headers)', () => {
      const result = headerSchema.safeParse({
        id: '123',
        name: 'X-Remove-Header',
        value: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject header missing id', () => {
      const result = headerSchema.safeParse({
        name: 'X-Custom-Header',
        value: 'test-value',
      });
      expect(result.success).toBe(false);
    });

    it('should reject header missing name', () => {
      const result = headerSchema.safeParse({
        id: '123',
        value: 'test-value',
      });
      expect(result.success).toBe(false);
    });

    it('should reject header missing value', () => {
      const result = headerSchema.safeParse({
        id: '123',
        name: 'X-Custom-Header',
      });
      expect(result.success).toBe(false);
    });

    it('should reject header with non-string id', () => {
      const result = headerSchema.safeParse({
        id: 123,
        name: 'X-Custom-Header',
        value: 'test-value',
      });
      expect(result.success).toBe(false);
    });

    it('should reject header with non-string name', () => {
      const result = headerSchema.safeParse({
        id: '123',
        name: 456,
        value: 'test-value',
      });
      expect(result.success).toBe(false);
    });

    it('should reject header with non-string value', () => {
      const result = headerSchema.safeParse({
        id: '123',
        name: 'X-Custom-Header',
        value: 789,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('profileSchema', () => {
    const validProfile = {
      id: 'profile-1',
      name: 'Test Profile',
      urlRegex: '^https://example\\.com/.*',
      headers: [{ id: 'h1', name: 'X-Test', value: 'value' }],
      enabled: true,
    };

    it('should accept valid profile', () => {
      const result = profileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should accept profile with empty headers array', () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        headers: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept profile with multiple headers', () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        headers: [
          { id: 'h1', name: 'X-Test-1', value: 'value1' },
          { id: 'h2', name: 'X-Test-2', value: 'value2' },
          { id: 'h3', name: 'X-Test-3', value: '' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should reject profile missing id', () => {
      const { id: _id, ...profileWithoutId } = validProfile;
      const result = profileSchema.safeParse(profileWithoutId);
      expect(result.success).toBe(false);
    });

    it('should reject profile missing name', () => {
      const { name: _name, ...profileWithoutName } = validProfile;
      const result = profileSchema.safeParse(profileWithoutName);
      expect(result.success).toBe(false);
    });

    it('should reject profile missing urlRegex', () => {
      const { urlRegex: _urlRegex, ...profileWithoutUrlRegex } = validProfile;
      const result = profileSchema.safeParse(profileWithoutUrlRegex);
      expect(result.success).toBe(false);
    });

    it('should reject profile missing headers', () => {
      const { headers: _headers, ...profileWithoutHeaders } = validProfile;
      const result = profileSchema.safeParse(profileWithoutHeaders);
      expect(result.success).toBe(false);
    });

    it('should reject profile missing enabled', () => {
      const { enabled: _enabled, ...profileWithoutEnabled } = validProfile;
      const result = profileSchema.safeParse(profileWithoutEnabled);
      expect(result.success).toBe(false);
    });

    it('should reject profile with non-boolean enabled', () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        enabled: 'yes',
      });
      expect(result.success).toBe(false);
    });

    it('should reject profile with invalid header in array', () => {
      const result = profileSchema.safeParse({
        ...validProfile,
        headers: [{ id: 'h1', name: 123, value: 'value' }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('exportSchema', () => {
    const validProfile = {
      id: 'profile-1',
      name: 'Test Profile',
      urlRegex: '^https://example\\.com/.*',
      headers: [{ id: 'h1', name: 'X-Test', value: 'value' }],
      enabled: true,
    };

    it('should accept empty array', () => {
      const result = exportSchema.safeParse([]);
      expect(result.success).toBe(true);
    });

    it('should accept array with single profile', () => {
      const result = exportSchema.safeParse([validProfile]);
      expect(result.success).toBe(true);
    });

    it('should accept array with multiple valid profiles', () => {
      const result = exportSchema.safeParse([
        validProfile,
        { ...validProfile, id: 'profile-2', name: 'Second Profile' },
        { ...validProfile, id: 'profile-3', name: 'Third Profile', enabled: false },
      ]);
      expect(result.success).toBe(true);
    });

    it('should reject non-array', () => {
      const result = exportSchema.safeParse(validProfile);
      expect(result.success).toBe(false);
    });

    it('should reject array with invalid profile', () => {
      const result = exportSchema.safeParse([
        validProfile,
        { ...validProfile, id: 'profile-2', name: 123 },
      ]);
      expect(result.success).toBe(false);
    });

    it('should reject array with null element', () => {
      const result = exportSchema.safeParse([validProfile, null]);
      expect(result.success).toBe(false);
    });

    it('should reject array with undefined element', () => {
      const result = exportSchema.safeParse([validProfile, undefined]);
      expect(result.success).toBe(false);
    });
  });
});
