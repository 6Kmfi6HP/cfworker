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

This project solves CORS issues by:

1. **Development Proxy**: Vite dev server proxies `/api/*` requests to `https://cfworkerback-pages5.pages.dev`
2. **Environment-based URLs**: Uses proxy paths in development, direct URLs in production
3. **Automatic Header Injection**: API client automatically adds required authentication headers

### Configuration

- **Development**: API calls go to `/api/createWorker` (proxied)
- **Production**: API calls go to `https://cfworkerback-pages5.pages.dev/createWorker` (direct)

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
