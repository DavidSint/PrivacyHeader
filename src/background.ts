import { Storage } from "@plasmohq/storage"
import { generateRulesFromProfiles } from "./lib/dnr-utils"
import type { Profile } from "./types"

const storage = new Storage({
  area: "local"
})

const PROFILES_KEY = "profiles"

// Listen for changes in the storage
storage.watch({
  [PROFILES_KEY]: async (c) => {
    const newProfiles = c.newValue as Profile[] | undefined
    if (newProfiles) {
      console.log("Profiles updated:", newProfiles)
      await updateDynamicRules(newProfiles)
    }
  }
})

async function updateDynamicRules(profiles: Profile[]) {
  // Generate the new rules
  const newRules = generateRulesFromProfiles(profiles)

  // Get existing dynamic rules to remove them first
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
  const existingRuleIds = existingRules.map((rule) => rule.id)

  // Update dynamic rules
  // We remove all existing ones and add the new ones to ensure consistency
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: newRules
  })

  console.log("Dynamic rules updated:", newRules)
}

// On install or startup, we might want to ensure rules are synced with storage
// But storage watch should handle updates.
// However, if the extension reloads, we might want to re-apply rules just in case.
chrome.runtime.onInstalled.addListener(async () => {
  const profiles = await storage.get<Profile[]>(PROFILES_KEY)
  if (profiles) {
      await updateDynamicRules(profiles)
  }
})
