import type { Profile } from "./types"

/**
 * Maps our profile concept to chrome.declarativeNetRequest rules.
 */
export function generateRulesFromProfiles(profiles: Profile[]): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = []
  let ruleId = 1

  profiles.forEach((profile, index) => {
    // Only process enabled profiles
    if (!profile.enabled) return

    // Requirement: regex must match the URL
    if (!profile.urlRegex) return

    if (profile.headers.length === 0) return

    // List of headers that Chrome's DNR API allows the 'APPEND' operation on.
    // Using native APPEND is preferred because the browser handles the correct separator.
    const NATIVE_APPENDABLE = new Set([
      "accept", "accept-encoding", "accept-language", "access-control-request-headers",
      "cache-control", "connection", "content-language", "cookie", "forwarded",
      "if-match", "if-none-match", "keep-alive", "range", "te", "trailer",
      "transfer-encoding", "upgrade", "user-agent", "via", "want-digest",
      "x-forwarded-for"
    ])

    // Group headers by name to handle duplicates
    const headerGroups = new Map<string, string[]>()
    profile.headers.forEach(h => {
      const lowerName = h.name.toLowerCase()
      if (!headerGroups.has(lowerName)) {
        headerGroups.set(lowerName, [])
      }
      headerGroups.get(lowerName)!.push(h.value)
    })

    const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] = []
    
    headerGroups.forEach((values, lowerName) => {
      // Find the original casing of the first header with this name
      const originalName = profile.headers.find(h => h.name.toLowerCase() === lowerName)?.name || lowerName
      
      if (NATIVE_APPENDABLE.has(lowerName)) {
        // Use native DNR APPEND for supported headers
        values.forEach((val, idx) => {
          requestHeaders.push({
            header: originalName,
            operation: idx === 0 
              ? chrome.declarativeNetRequest.HeaderOperation.SET 
              : chrome.declarativeNetRequest.HeaderOperation.APPEND,
            value: val
          })
        })
      } else {
        // Manual fallback for custom headers using SET with correct separator
        // RFC 7230: Multiple header fields with the same name can be combined with commas.
        // Exception: Cookie uses semicolon (though standard says it should be appendable in DNR, 
        // we handle it here if it wasn't for some reason or just to be safe).
        const separator = lowerName === "cookie" ? "; " : ", "
        requestHeaders.push({
          header: originalName,
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          value: values.join(separator)
        })
      }
    })

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
        // Explicitly include all common resource types
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
