import { generateRulesFromProfiles } from "@/utils/dnr-utils";
import type { Profile } from "@/utils/types";
import { storage } from "wxt/storage";

export default defineBackground(() => {
  // Listen for changes in the storage
  storage.watch<Profile[]>("local:profiles", async (newProfiles, _oldProfiles) => {
    if (newProfiles) {
      console.log("Profiles updated:", newProfiles);
      await updateDynamicRules(newProfiles);
    }
  });

  async function updateDynamicRules(profiles: Profile[]) {
    // Generate the new rules
    const newRules = generateRulesFromProfiles(profiles);

    // Get existing dynamic rules to remove them first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map((rule) => rule.id);

    // Update dynamic rules
    // We remove all existing ones and add the new ones to ensure consistency
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: newRules,
    });

    console.log("Dynamic rules updated:", newRules);
  }

  // On install or startup, we might want to ensure rules are synced with storage
  // But storage watch should handle updates.
  // However, if the extension reloads, we might want to re-apply rules just in case.
  // Note: WXT storage.watch triggers on change, but maybe not on initial load if we don't read it.
});
