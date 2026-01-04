import type { Profile } from "../types"

// This maps our profile concept to chrome.declarativeNetRequest rules
export function generateRulesFromProfiles(profiles: Profile[]): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = []
  let ruleId = 1

  // Priorities: Higher value = Higher priority.
  // We want the profiles later in the list to have higher priority if they conflict (based on user requirement).
  // Profiles in the array are [0, 1, 2]. 2 should override 1.
  // So priority can be index + 1.

  profiles.forEach((profile, index) => {
    // Only process enabled profiles
    if (!profile.enabled) return

    // If no regex is provided, we can't match safely, or maybe match all?
    // Requirement says: "regex must match the URL to enable it as well".
    // So if regex is empty, it probably shouldn't match anything or we treat it as invalid.
    // Let's assume non-empty regex is required for functionality.
    if (!profile.urlRegex) return

    // We create one rule per profile to modify headers
    // But wait, declarativeNetRequest rules operate on requests.
    // If a profile has multiple headers, we can add them all in one rule action.

    if (profile.headers.length === 0) return

    const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] = profile.headers.map(h => ({
      header: h.name,
      operation: chrome.declarativeNetRequest.HeaderOperation.APPEND,
      value: h.value
    }))

    const rule: chrome.declarativeNetRequest.Rule = {
      id: ruleId++,
      priority: index + 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: requestHeaders
      },
      condition: {
        regexFilter: profile.urlRegex,
        resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
            chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
            chrome.declarativeNetRequest.ResourceType.STYLESHEET,
            chrome.declarativeNetRequest.ResourceType.SCRIPT,
            chrome.declarativeNetRequest.ResourceType.IMAGE,
            chrome.declarativeNetRequest.ResourceType.FONT,
            chrome.declarativeNetRequest.ResourceType.OBJECT,
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            chrome.declarativeNetRequest.ResourceType.PING,
            chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
            chrome.declarativeNetRequest.ResourceType.MEDIA,
            chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
            chrome.declarativeNetRequest.ResourceType.OTHER
        ]
      }
    }
    rules.push(rule)
  })

  return rules
}
