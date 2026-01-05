import { describe, it, expect, beforeAll } from 'vitest'
import { generateRulesFromProfiles } from './dnr-utils'
import type { Profile } from './types'

// Mock chrome API
beforeAll(() => {
  global.chrome = {
    declarativeNetRequest: {
      HeaderOperation: {
        SET: 'set',
        APPEND: 'append'
      },
      RuleActionType: {
        MODIFY_HEADERS: 'modifyHeaders'
      },
      ResourceType: {
        MAIN_FRAME: 'main_frame',
        SUB_FRAME: 'sub_frame',
        STYLESHEET: 'stylesheet',
        SCRIPT: 'script',
        IMAGE: 'image',
        FONT: 'font',
        OBJECT: 'object',
        XMLHTTPREQUEST: 'xmlhttprequest',
        PING: 'ping',
        CSP_REPORT: 'csp_report',
        MEDIA: 'media',
        WEBSOCKET: 'websocket',
        OTHER: 'other'
      }
    }
  } as unknown as typeof chrome
})

describe('generateRulesFromProfiles', () => {
  it('should return empty rules if no profiles', () => {
    const rules = generateRulesFromProfiles([])
    expect(rules).toEqual([])
  })

  it('should ignore disabled profiles', () => {
    const profiles: Profile[] = [
      {
        id: '1',
        name: 'Test',
        urlRegex: '.*',
        headers: [{ id: 'h1', name: 'X-Test', value: '1' }],
        enabled: false
      }
    ]
    const rules = generateRulesFromProfiles(profiles)
    expect(rules).toEqual([])
  })

  it('should ignore profiles with empty headers', () => {
    const profiles: Profile[] = [
      {
        id: '1',
        name: 'Test',
        urlRegex: '.*',
        headers: [],
        enabled: true
      }
    ]
    const rules = generateRulesFromProfiles(profiles)
    expect(rules).toEqual([])
  })

  it('should generate a valid rule for an enabled profile with SET operation', () => {
    const profiles: Profile[] = [
      {
        id: '1',
        name: 'Test',
        urlRegex: 'example.com',
        headers: [{ id: 'h1', name: 'X-Test', value: '123' }],
        enabled: true
      }
    ]
    const rules = generateRulesFromProfiles(profiles)
    expect(rules).toHaveLength(1)
    expect(rules[0].id).toBe(1)
    expect(rules[0].priority).toBe(1)
    expect(rules[0].condition.regexFilter).toBe('example.com')
    expect(rules[0].action.type).toBe('modifyHeaders')
    expect(rules[0].action.requestHeaders).toEqual([
      { header: 'X-Test', operation: 'set', value: '123' }
    ])
  })

  it('should assign priorities correctly based on list order (first in list = higher priority)', () => {
    const profiles: Profile[] = [
      {
        id: '1',
        name: 'First',
        urlRegex: '.*',
        headers: [{ id: 'h1', name: 'A', value: '1' }],
        enabled: true
      },
      {
        id: '2',
        name: 'Second',
        urlRegex: '.*',
        headers: [{ id: 'h2', name: 'B', value: '2' }],
        enabled: true
      }
    ]
    const rules = generateRulesFromProfiles(profiles)
    expect(rules).toHaveLength(2)
    // First in list has higher priority (len(2) - idx(0) = 2)
    expect(rules[0].priority).toBe(2)
    expect(rules[0].action.requestHeaders?.[0].header).toBe('A')

    // Second in list has lower priority (len(2) - idx(1) = 1)
    expect(rules[1].priority).toBe(1)
    expect(rules[1].action.requestHeaders?.[0].header).toBe('B')
  })

  it('should use native SET/APPEND for standard headers and merged SET for custom ones', () => {
    const profiles: Profile[] = [
      {
        id: '1',
        name: 'Test',
        urlRegex: '.*',
        headers: [
          { id: 'h1', name: 'User-Agent', value: 'ua1' },
          { id: 'h2', name: 'User-Agent', value: 'ua2' },
          { id: 'h3', name: 'X-Custom', value: 'c1' },
          { id: 'h4', name: 'X-Custom', value: 'c2' }
        ],
        enabled: true
      }
    ]
    const rules = generateRulesFromProfiles(profiles)
    expect(rules).toHaveLength(1)
    expect(rules[0].action.requestHeaders).toEqual([
      { header: 'User-Agent', operation: 'set', value: 'ua1' },
      { header: 'User-Agent', operation: 'append', value: 'ua2' },
      { header: 'X-Custom', operation: 'set', value: 'c1, c2' }
    ])
  })
})
