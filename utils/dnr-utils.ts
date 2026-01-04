import type { Profile } from "./types"

// This maps our profile concept to chrome.declarativeNetRequest rules
export function generateRulesFromProfiles(profiles: Profile[]): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = []
  let ruleId = 1

  // Priorities: Higher value = Higher priority.
  // We want the profiles later in the list to have higher priority if they conflict.

  profiles.forEach((profile, index) => {
    // Only process enabled profiles
    if (!profile.enabled) return

    // Requirement: regex must match the URL
    if (!profile.urlRegex) return

    if (profile.headers.length === 0) return

    // Requirement: Conflict resolution = "both should be sent" -> APPEND
    const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] = profile.headers.map(h => ({
      header: h.name,
      operation: chrome.declarativeNetRequest.HeaderOperation.APPEND,
      value: h.value
    }))

    const rule: chrome.declarativeNetRequest.Rule = {
      id: ruleId++,
      // Higher priority rules apply first. We want earlier profiles in the list to apply first.
      priority: profiles.length - index,
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
