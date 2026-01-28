# Repository Architecture Guide for AI Agents

This repository functions as a "poly-repo" containing two distinct, isolated applications.

## 📂 Project Structure

### `/src` - Browser Extension

The core product. A browser extension built with **WXT**.

- **Tech Stack**: React, Tailwind CSS, WXT.
- **Context**: Browser extension (Manifest V3).
- **Key Commands**:
  - `pnpm dev`: Start dev server (Chrome).
  - `pnpm build`: Build production extension.

### `/docs` - Documentation Website

The public documentation site.

- **Tech Stack**: TanStack Start, Fumadocs, Tailwind CSS.
- **Context**: Static Web App (SSG) deployed to GitHub Pages.
- **Routing**: Root-level routing (e.g., `/profiles`, NOT `/docs/profiles`).
- **Key Commands**:
  - `pnpm dev`: Start doc site dev server.
  - `pnpm build`: Build static site for deployment.

## ⚠️ Important Rules for Agents

1.  **Isolation**: These two folders are **completely independent**.
    - They do **NOT** share `node_modules`.
    - They do **NOT** share a `pnpm-workspace.yaml`.
    - Always `cd` into the specific directory (`src` or `docs`) before running commands or installing packages.

2.  **Context Switching**:
    - If working on the **Extension**, focus entirely on `src/`.
    - If working on the **Website**, focus entirely on `docs/`.

3.  **Deployment**:
    - The `docs` folder is deployed via GitHub Actions (`.github/workflows/deploy-docs.yml`).
