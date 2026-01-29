import { test as base, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, '../.output/chrome-mv3');

type ExtensionFixtures = {
  context: BrowserContext;
  extensionId: string;
  popupPage: Page;
};

/* eslint-disable react-hooks/rules-of-hooks */
const test = base.extend<ExtensionFixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
  popupPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState('domcontentloaded');
    await use(page);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

test.describe('Popup UI', () => {
  test('should render empty state initially', async ({ popupPage }) => {
    await expect(popupPage.getByText('Privacy Header', { exact: true })).toBeVisible();
    await expect(popupPage.getByText('No profiles found.')).toBeVisible();
  });

  test('should create, edit, and delete a profile', async ({ popupPage }) => {
    // 1. Create Profile
    await popupPage.getByRole('button', { name: 'New Profile' }).click();
    
    // Verify Editor is open
    await expect(popupPage.getByText('Changes are saved automatically.')).toBeVisible();
    
    // Fill form
    await popupPage.getByLabel('Profile Name').fill('Test Profile');
    await popupPage.getByLabel('URL Regex').fill('^https://example.com/.*');
    
    // Header inputs (first row)
    await popupPage.getByPlaceholder('Header Name').first().fill('X-Test');
    await popupPage.getByPlaceholder('Header Value').first().fill('123');
    
    // Wait for auto-save (debounce 500ms)
    await popupPage.waitForTimeout(1000);
    
    // Go back
    await popupPage.locator('.lucide-arrow-left').click();
    
    // Verify created
    await expect(popupPage.getByText('No profiles found.')).not.toBeVisible();
    await expect(popupPage.getByText('Test Profile')).toBeVisible();
    await expect(popupPage.getByText('^https://example.com/.*')).toBeVisible();
    await expect(popupPage.getByText('1 header')).toBeVisible();

    // 2. Edit Profile
    await popupPage.getByText('Test Profile').click();
    await expect(popupPage.getByLabel('Profile Name')).toHaveValue('Test Profile');
    
    // Update Name
    await popupPage.getByLabel('Profile Name').fill('Updated Profile');
    await popupPage.waitForTimeout(1000); // Wait for auto-save
    
    // Go back
    await popupPage.locator('.lucide-arrow-left').click();
    
    // Verify update
    await expect(popupPage.getByText('Test Profile')).not.toBeVisible();
    await expect(popupPage.getByText('Updated Profile')).toBeVisible();

    // 3. Delete Profile
    // The delete button is visible on the list item
    await popupPage.locator('.lucide-trash-2').click();
    
    // Verify deletion
    await expect(popupPage.getByText('No profiles found.')).toBeVisible();
  });

  test('should validate required fields', async ({ popupPage }) => {
    await popupPage.getByRole('button', { name: 'New Profile' }).click();
    
    // Name is empty, Regex is default. Clear regex.
    await popupPage.getByLabel('URL Regex').fill('');
    await popupPage.getByLabel('Profile Name').focus(); // Blur regex
    
    // Wait for debounce
    await popupPage.waitForTimeout(1000);
    
    // Expect errors (auto-save tries and fails, setting errors state)
    await expect(popupPage.getByText('Profile name is required')).toBeVisible();
    await expect(popupPage.getByText('URL Regex is required')).toBeVisible();
  });

  test('should allow headers with empty values (unset headers)', async ({ popupPage }) => {
    await popupPage.getByRole('button', { name: 'New Profile' }).click();
    
    // Fill required fields
    await popupPage.getByLabel('Profile Name').fill('Test Profile');
    
    // Wait for initial save
    await popupPage.waitForTimeout(600);
    
    // Add header with only name (empty value = unset header)
    await popupPage.getByPlaceholder('Header Name').first().fill('X-Remove-Me');
    
    // Wait for auto-save
    await popupPage.waitForTimeout(1000);
    
    // Go back to list - should save successfully without validation error
    await popupPage.locator('.lucide-arrow-left').click();
    
    // Verify profile was created with the header
    await expect(popupPage.getByText('Test Profile')).toBeVisible();
    await expect(popupPage.getByText('1 header')).toBeVisible();
    
    // Edit the profile to verify header was saved
    await popupPage.getByText('Test Profile').click();
    await expect(popupPage.getByPlaceholder('Header Name').first()).toHaveValue('X-Remove-Me');
    await expect(popupPage.getByPlaceholder('Header Value').first()).toHaveValue('');
  });

  test('should export profiles as JSON file', async ({ popupPage }) => {


    // First create a profile to export
    await popupPage.getByRole('button', { name: 'New Profile' }).click();
    await popupPage.getByLabel('Profile Name').fill('Export Test Profile');
    await popupPage.getByPlaceholder('Header Name').first().fill('X-Export');
    await popupPage.getByPlaceholder('Header Value').first().fill('test');
    await popupPage.waitForTimeout(1000);
    await popupPage.locator('.lucide-arrow-left').click();
    
    // Wait for list to be visible
    await expect(popupPage.getByText('Export Test Profile')).toBeVisible();
    
    // Open dropdown menu
    await popupPage.getByTestId('menu-button').click();

    
    // Set up download promise before clicking export
    const downloadPromise = popupPage.waitForEvent('download');
    
    // Click export
    await popupPage.getByText('Export JSON').click();
    
    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('privacy-header-profiles.json');
  });

  test('should import valid profile JSON', async ({ popupPage }) => {
    const validProfiles = [
      {
        id: 'imported-1',
        name: 'Imported Profile',
        urlRegex: '^https://test\\.com/.*',
        headers: [{ id: 'h1', name: 'X-Imported', value: 'yes' }],
        enabled: true,
      },
    ];

    // Create a temporary file for import
    const fileContent = JSON.stringify(validProfiles);
    
    // Open dropdown and click import
    await popupPage.getByTestId('menu-button').click();
    
    // Set up file chooser before clicking import
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    
    // Create a buffer from the JSON content
    await fileChooser.setFiles({
      name: 'profiles.json',
      mimeType: 'application/json',
      buffer: Buffer.from(fileContent),
    });
    
    // Verify the profile was imported
    await expect(popupPage.getByText('Imported Profile')).toBeVisible();
    await expect(popupPage.getByText('^https://test\\.com/.*')).toBeVisible();
  });

  test('should import multiple profiles', async ({ popupPage }) => {
    const multipleProfiles = [
      {
        id: 'multi-1',
        name: 'First Imported',
        urlRegex: '.*first.*',
        headers: [],
        enabled: true,
      },
      {
        id: 'multi-2',
        name: 'Second Imported',
        urlRegex: '.*second.*',
        headers: [{ id: 'h1', name: 'X-Test', value: 'val' }],
        enabled: false,
      },
    ];

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'profiles.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(multipleProfiles)),
    });
    
    await expect(popupPage.getByText('First Imported')).toBeVisible();
    await expect(popupPage.getByText('Second Imported')).toBeVisible();
  });

  test('should show error for invalid JSON syntax', async ({ popupPage }) => {
    // Set up dialog handler for alert
    popupPage.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Failed to parse JSON');
      await dialog.accept();
    });

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ not valid json'),
    });
    
    // Profile should not appear, list should still be empty
    await expect(popupPage.getByText('No profiles found.')).toBeVisible();
  });

  test('should show error for invalid schema', async ({ popupPage }) => {
    const invalidSchema = [
      {
        id: 'bad-1',
        name: 123, // Should be string
        urlRegex: '.*',
        headers: [],
        enabled: true,
      },
    ];

    popupPage.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Invalid profile file format');
      await dialog.accept();
    });

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'invalid-schema.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(invalidSchema)),
    });
    
    await expect(popupPage.getByText('No profiles found.')).toBeVisible();
  });

  test('should show error for missing required fields', async ({ popupPage }) => {
    const missingFields = [
      {
        id: 'missing-1',
        urlRegex: '.*',
        headers: [],
        enabled: true,
      },
    ];

    popupPage.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Invalid profile file format');
      await dialog.accept();
    });

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'missing-fields.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(missingFields)),
    });
    
    await expect(popupPage.getByText('No profiles found.')).toBeVisible();
  });

  test('should merge imported profiles with existing ones', async ({ popupPage }) => {
    // First create an existing profile
    await popupPage.getByRole('button', { name: 'New Profile' }).click();
    await popupPage.getByLabel('Profile Name').fill('Existing Profile');
    await popupPage.waitForTimeout(1000);
    await popupPage.locator('.lucide-arrow-left').click();
    await expect(popupPage.getByText('Existing Profile')).toBeVisible();

    // Now import another profile
    const newProfile = [
      {
        id: 'new-1',
        name: 'Newly Imported',
        urlRegex: '.*new.*',
        headers: [],
        enabled: true,
      },
    ];

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'new-profile.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(newProfile)),
    });
    
    // Both profiles should be visible
    await expect(popupPage.getByText('Existing Profile')).toBeVisible();
    await expect(popupPage.getByText('Newly Imported')).toBeVisible();
  });

  test('should import profile with empty headers array', async ({ popupPage }) => {
    const emptyHeaders = [
      {
        id: 'empty-headers-1',
        name: 'No Headers Profile',
        urlRegex: '.*empty.*',
        headers: [],
        enabled: true,
      },
    ];

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'empty-headers.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(emptyHeaders)),
    });
    
    await expect(popupPage.getByText('No Headers Profile')).toBeVisible();
    await expect(popupPage.getByText('0 headers')).toBeVisible();
  });

  test('should import profile with header that has empty value', async ({ popupPage }) => {
    const emptyValueHeader = [
      {
        id: 'empty-val-1',
        name: 'Remove Header Profile',
        urlRegex: '.*remove.*',
        headers: [{ id: 'h1', name: 'X-Remove-Me', value: '' }],
        enabled: true,
      },
    ];

    await popupPage.getByTestId('menu-button').click();
    const fileChooserPromise = popupPage.waitForEvent('filechooser');
    await popupPage.getByText('Import JSON').click();
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'empty-value.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(emptyValueHeader)),
    });
    
    await expect(popupPage.getByText('Remove Header Profile')).toBeVisible();
    
    // Open the profile to verify header was imported correctly
    await popupPage.getByText('Remove Header Profile').click();
    await expect(popupPage.getByPlaceholder('Header Name').first()).toHaveValue('X-Remove-Me');
    await expect(popupPage.getByPlaceholder('Header Value').first()).toHaveValue('');
  });
});
