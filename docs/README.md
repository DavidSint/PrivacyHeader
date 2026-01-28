# Privacy Header Documentation

This subdirectory contains the source code for the official Privacy Header documentation website.

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start-introduction)
- **Documentation**: [Fumadocs](https://fumadocs.vercel.app/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting**: [Biome](https://biomejs.com/)

## 🛠️ Development

This project is intentionally isolated from the main extension code in `/src`. Before running commands, ensure you are in the `docs/` directory.

### Local Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Key Commands

- `pnpm dev`: Start the local development server.
- `pnpm build`: Generate a static build for production.
- `pnpm lint`: Run Biome linting and formatting checks.
- `pnpm format`: Automatically fix formatting with Biome.

## 📂 Project Structure

- `content/docs/`: MDX files containing the actual documentation content.
- `src/components/`: Shared UI components.
- `src/routes/`: TanStack Router configuration and page components.
- `public/`: Static assets (images, icons).

## 🚢 Deployment

The documentation is automatically built and deployed to GitHub Pages via the `.github/workflows/deploy-docs.yml` workflow whenever changes are pushed to the main branch.
