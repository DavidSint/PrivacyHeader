import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import background from '../entrypoints/background';
import { storage } from '#imports';
import { generateRulesFromProfiles } from '@/utils/dnr-utils';

// Mock dnr-utils
vi.mock('@/utils/dnr-utils', () => ({
  generateRulesFromProfiles: vi.fn(),
}));

describe('Background Script', () => {
  const mockUpdateDynamicRules = vi.fn();
  const mockGetDynamicRules = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock chrome API
    global.chrome = {
      declarativeNetRequest: {
        updateDynamicRules: mockUpdateDynamicRules,
        getDynamicRules: mockGetDynamicRules,
      }
    } as unknown as typeof chrome;
  });

  it('should sync rules on initialization', async () => {
    const mockProfiles = [{ id: '1', name: 'Test', enabled: true }];
    const mockRules = [{ id: 1 }];

    (storage.getItem as Mock).mockResolvedValue(mockProfiles);
    (generateRulesFromProfiles as Mock).mockReturnValue(mockRules);
    mockGetDynamicRules.mockResolvedValue([]); // No existing rules

    // Trigger main
    background.main();

    // Wait for async tasks to complete
    await new Promise(process.nextTick);

    expect(storage.getItem).toHaveBeenCalledWith('local:profiles');
    expect(generateRulesFromProfiles).toHaveBeenCalledWith(mockProfiles);
    expect(mockUpdateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [],
      addRules: mockRules,
    });
  });

  it('should clear existing rules before adding new ones', async () => {
    const mockProfiles = [{ id: '1', enabled: true }];
    const mockRules = [{ id: 1 }];
    const existingRules = [{ id: 999 }];

    (storage.getItem as Mock).mockResolvedValue(mockProfiles);
    (generateRulesFromProfiles as Mock).mockReturnValue(mockRules);
    mockGetDynamicRules.mockResolvedValue(existingRules);

    background.main();
    await new Promise(process.nextTick);

    expect(mockUpdateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [999],
      addRules: mockRules,
    });
  });

  it('should watch for storage changes and update rules', async () => {
    // Setup watch mock to capture the callback
    let watchCallback: (profiles: Profile[]) => void;
    (storage.watch as Mock).mockImplementation((key: string, cb: (profiles: Profile[]) => void) => {
      watchCallback = cb;
      return () => {};
    });

    background.main();

    // Verify watch was set up
    expect(storage.watch).toHaveBeenCalledWith('local:profiles', expect.any(Function));

    // Simulate storage change
    const newProfiles = [{ id: '2', enabled: true }];
    const newRules = [{ id: 2 }];
    
    (generateRulesFromProfiles as Mock).mockReturnValue(newRules);
    mockGetDynamicRules.mockResolvedValue([]);

    // Trigger callback
    // @ts-expect-error watchCallback is not defined in the test environment
    await watchCallback(newProfiles);

    expect(generateRulesFromProfiles).toHaveBeenCalledWith(newProfiles);
    expect(mockUpdateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [],
      addRules: newRules
    });
  });
});
