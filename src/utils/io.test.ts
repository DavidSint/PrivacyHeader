import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { importProfilesFromFile, exportProfiles } from './io';
import { Profile } from './types';

describe('io utils', () => {
  const mockProfiles: Profile[] = [
    {
      id: '1',
      name: 'Test Profile',
      urlRegex: '.*',
      headers: [{ id: '1', name: 'X-Test', value: '1' }],
      enabled: true,
    },
  ];

  describe('importProfilesFromFile', () => {
    it('should parse and validate valid profile JSON', async () => {
      const file = new File([JSON.stringify(mockProfiles)], 'profiles.json', {
        type: 'application/json',
      });

      const result = await importProfilesFromFile(file);
      expect(result).toEqual(mockProfiles);
    });

    it('should reject invalid JSON syntax', async () => {
      const file = new File(['invalid-json'], 'profiles.json', {
        type: 'application/json',
      });

      await expect(importProfilesFromFile(file)).rejects.toThrow(
        'Failed to parse JSON'
      );
    });

    it('should reject invalid schema', async () => {
      const invalidData = [{ ...mockProfiles[0], name: 123 }]; // name should be string
      const file = new File([JSON.stringify(invalidData)], 'profiles.json', {
        type: 'application/json',
      });

      await expect(importProfilesFromFile(file)).rejects.toThrow(
        'Invalid profile file format'
      );
    });

    it('should validate all fields in schema', async () => {
      const invalidData = [
        {
          // missing id
          name: 'Test',
          urlRegex: '.*',
          headers: [],
          enabled: true,
        },
      ];
      const file = new File([JSON.stringify(invalidData)], 'profiles.json', {
        type: 'application/json',
      });

      await expect(importProfilesFromFile(file)).rejects.toThrow(
        'Invalid profile file format'
      );
    });
  });

  describe('exportProfiles', () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createObjectURLMock = vi.fn();
    const revokeObjectURLMock = vi.fn();
    const clickMock = vi.fn();
    const removeChildMock = vi.fn();
    const appendChildMock = vi.fn();

    beforeEach(() => {
        global.URL.createObjectURL = createObjectURLMock;
        global.URL.revokeObjectURL = revokeObjectURLMock;
        createObjectURLMock.mockReturnValue('blob:test-url');
        
        // Mock document.createElement and body methods
        vi.spyOn(document, 'createElement').mockReturnValue({
            click: clickMock,
            href: '',
            download: '',
        } as unknown as HTMLElement);
        
        vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock);
        vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create a blob and trigger download', () => {
      exportProfiles(mockProfiles);

      // Verify Blob creation (hard to spy on Blob explicitly, but we can verify createObjectURL called)
      expect(createObjectURLMock).toHaveBeenCalled();
      
      // Verify anchor link properties
      const anchor = document.createElement('a') as HTMLAnchorElement; // getting the mock
      // Actually our mock returns a new object each time or we need to capture what was returned.
      // Since we mocked createElement implementation, let's refine the mock or check implementation details.
    
      // Better spy:
      expect(appendChildMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
    });
  });
});
