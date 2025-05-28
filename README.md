# Cloudflare Worker Management Tool

A React + TypeScript + Vite application for managing Cloudflare Workers with bulk deployment capabilities.

## Features

- 🚀 Bulk worker deployment across multiple Cloudflare accounts
- 🔐 Secure account management with API key isolation
- 🌐 Multi-language support (i18n)
- 📊 Real-time deployment progress tracking
- 🎨 Modern UI with Ant Design components

## Quick Start

### 1. Setup Environment

First, create your environment configuration:

```bash
npm run setup
# or
pnpm setup
```

This will create a `.env` file with default settings. You can modify the values as needed.

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The development server includes a CORS proxy that routes `/api/*` requests to the backend API, solving cross-origin issues.

## CORS Solution

This project uses **Cloudflare Pages Functions** to solve CORS issues in both development and production:

1. **Development Proxy**: Vite dev server proxies `/api/*` requests to the backend API
2. **Production Proxy**: Cloudflare Pages Functions handle `/api/*` requests as a reverse proxy
3. **Unified API Paths**: Both environments use the same `/api/*` paths for consistency
4. **Automatic CORS Headers**: Pages Functions automatically add required CORS headers

### How It Works

```
Frontend → /api/* → Pages Function → Backend API
```

- **Development**: Vite proxy handles the routing
- **Production**: `functions/api/[...path].ts` handles the routing

### Configuration

- **All Environments**: API calls go to `/api/createWorker` (proxied)
- **Backend Target**: Configurable via `API_TARGET` environment variable
- **Default Target**: `https://cfworkerback-pages5.pages.dev`

For detailed information, see [CORS_SOLUTION.md](./CORS_SOLUTION.md).

## Build and Deploy

```bash
npm run build
npm run deploy
```

## Project Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Environment Variables

- `VITE_API_ENDPOINT`: Backend API endpoint
- `VITE_MAX_PROXY_IPS`: Maximum number of proxy IPs

## ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
