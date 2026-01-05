import { generateRulesFromProfiles } from "@/utils/dnr-utils";
import type { Profile } from "@/utils/types";
import { storage } from '#imports';

export default defineBackground(() => {
  // Initial sync when the background script starts
  const syncRules = async () => {
    const profiles = await storage.getItem<Profile[]>("local:profiles");
    if (profiles) {
      console.log("Initial profile sync:", profiles);
      await updateDynamicRules(profiles);
    }
  };

  syncRules();

  // Listen for changes in the storage
  storage.watch<Profile[]>("local:profiles", async (newProfiles) => {
    console.log("Profiles updated in storage, re-applying rules:", newProfiles);
    await updateDynamicRules(newProfiles || []);
  });

  async function updateDynamicRules(profiles: Profile[]) {
    try {
      // Generate the new rules
      const newRules = generateRulesFromProfiles(profiles);

      // Get existing dynamic rules to remove them all
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map((rule) => rule.id);

      // Update dynamic rules
      // We remove all existing ones and add the new ones to ensure consistency
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: newRules,
      });

      console.log("Dynamic rules updated. Total rules active:", newRules.length);
      if (newRules.length > 0) {
        console.debug("Rules detail:", JSON.stringify(newRules, null, 2));
      }
    } catch (error) {
      console.error("Failed to update dynamic rules:", error);
    }
  }
});
