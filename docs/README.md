# Privacy Header Documentation

This subdirectory contains the source code for the official Privacy Header documentation website.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with [Static Export](https://nextjs.org/docs/app/guides/static-exports)
- **Documentation**: [Fumadocs](https://fumadocs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting**: [Biome](https://biomejs.dev/)

## 🛠️ Development

This project is intentionally isolated from the main extension code in `/src`. Before running commands, ensure you are in the `docs/` directory.

### Local Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:3000 with your browser to see the result.

### Key Commands

- `pnpm dev`: Start the local development server.
- `pnpm build`: Generate a static build for production (outputs to `out/`).
- `pnpm lint`: Run Biome linting and formatting checks.
- `pnpm format`: Automatically fix formatting with Biome.

## 📂 Project Structure

| Directory/File          | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `content/docs/`         | MDX files containing the documentation content.        |
| `app/[[...slug]]`       | The documentation pages (root catch-all).              |
| `lib/source.ts`         | Content source adapter for accessing MDX content.      |
| `lib/layout.shared.tsx` | Shared layout options for the docs UI.                 |
| `public/`               | Static assets (images, icons).                         |
| `source.config.ts`      | Fumadocs MDX configuration (frontmatter schema, etc.). |

## 🚢 Deployment

The documentation is automatically built and deployed to GitHub Pages via the `.github/workflows/deploy-docs.yml` workflow whenever changes are pushed to the main branch.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs.
