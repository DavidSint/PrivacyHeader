# Source Code Review

This document provides instructions for Chrome/Firefox Web/Add-on Store reviewers to build the and verify the extension from source code.

## 1. Project Overview

- **Name:** Privacy Header
- **Framework:** [WXT](https://wxt.dev/)
- **Build Tool:** Vite (via WXT)
- **Primary API:** `declarativeNetRequest`

## 2. Environment Requirements

- **Node.js:** v20.x or higher (recommended)
- **Package Manager:** `pnpm`

## 3. Build Instructions

Follow these steps to generate the production-ready extension package:

```bash
# 1. Install dependencies
pnpm i

# 2. Build the extension for Chrome (Manifest V3)
pnpm build
```

The build output will be located in:
`.output/chrome-mv3`

## 4. Understanding the Codebase

- **`entrypoints/`**: Contains the main entry points for the extension:
  - `popup/`: The user interface for managing profiles.
  - `background.ts`: Minimal background logic ensuring rules are synced.
- **`utils/dnr-utils.ts`**: The core logic that converts user-defined profiles into `chrome.declarativeNetRequest` rules. This is the primary area for reviewing how headers are modified.
- **`components/`**: React components used in the popup.
- **`wxt.config.ts`**: Configuration for WXT, including manifest permissions and build settings.

## 5. Justification for Sensitive Permissions

The extension requests `<all_urls>` and `declarativeNetRequest` to allow users to automatically modify headers on any domain they define in their local profiles. The extension **does not** use `webRequest` (which would allow reading data) and instead relies on the privacy-preserving `declarativeNetRequest` API where the browser handles the filtering.

---

For any questions regarding the build process or codebase, please contact the developer David Sint.
