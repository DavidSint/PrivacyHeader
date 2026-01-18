# Privacy Header

A privacy-focused browser extension for granular HTTP header manipulation. Built with **WXT**, **React**, and **Tailwind CSS**, it leverages the modern `declarativeNetRequest` API to modify headers securely and efficiently.

## Features

- **Profile Management**: Create, edit, and toggle multiple header modification profiles.
- **Regex Targeting**: Apply modifications only to specific domains or URLs using powerful regex patterns.
- **Dynamic Header Operations**:
  - **Set/Replace**: Override existing headers.
  - **Append**: Safely add multiple values (e.g., for `Cookie` or `Accept` headers).
- **Privacy First**: Uses Chrome's native filtering engine—your request data stays in the browser and is never read by the extension.
- **Modern UI**: Clean, responsive interface built with Shadcn/UI components.

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Web Extension Toolbox)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: Browser `storage` API with local persistence.
- **Network API**: `declarativeNetRequest` (Manifest V3 compatible).

## Installation & Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/DavidSint/PrivacyHeader.git
cd PrivacyHeader

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server for Chrome
pnpm dev

# Start development server for Firefox
pnpm dev:firefox
```

### Production Build

```bash
# Build for Chrome
pnpm build

# Build for Firefox
pnpm build:firefox

# Create zip for distribution
pnpm zip
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See [LICENSE](LICENSE) for details.
