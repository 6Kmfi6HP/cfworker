# Cloudflare Pages Functions CORS 解决方案

本项目使用 Cloudflare Pages Functions 来解决生产环境中的 CORS（跨域资源共享）问题。

## 解决方案概述

### 问题
在生产环境中，前端应用直接调用后端 API 时会遇到 CORS 错误，因为浏览器的同源策略限制了跨域请求。

### 解决方案
使用 Cloudflare Pages Functions 作为反向代理，将所有 `/api/*` 请求代理到后端 API，同时添加适当的 CORS 头部。

## 架构说明

```
前端应用 → /api/* → Cloudflare Pages Function → 后端 API
```

### 开发环境
- Vite 开发服务器的代理功能处理 `/api/*` 请求
- 配置在 `vite.config.ts` 中

### 生产环境
- Cloudflare Pages Functions 处理 `/api/*` 请求
- 函数位于 `functions/api/createWorker.ts`

## 文件结构

```
cfworker/
├── functions/
│   └── api/
│       └── createWorker.ts       # Pages Function 反向代理
├── src/
│   └── utils/
│       └── constants.ts          # API 端点配置
├── vite.config.ts               # 开发环境代理配置
└── wrangler.toml               # Cloudflare 配置
```

## 配置说明

### 1. Pages Function (`functions/api/createWorker.ts`)

这个函数处理 `/api/createWorker` 路径的请求：

- **精确匹配**: 专门处理 `createWorker` 端点
- **方法支持**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **CORS 头部**: 自动添加必要的 CORS 头部
- **错误处理**: 包含完整的错误处理和日志记录

### 2. 环境变量配置 (`wrangler.toml`)

```toml
[vars]
API_TARGET = "https://cfworkerback-pages5.pages.dev"
```

### 3. API 端点配置 (`src/utils/constants.ts`)

```typescript
// 统一使用代理路径，适用于开发和生产环境
export const API_ENDPOINT = '/api/createWorker';
```

### 4. 开发环境代理 (`vite.config.ts`)

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://cfworkerback-pages5.pages.dev',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      // ... 其他配置
    }
  }
}
```

## 部署步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 部署到 Cloudflare Pages
```bash
npm run deploy
# 或者
wrangler pages deploy
```

### 3. 配置环境变量（可选）

在 Cloudflare Dashboard 中：
1. 进入 Pages 项目设置
2. 找到 "Environment variables" 部分
3. 添加 `API_TARGET` 变量（如果需要覆盖默认值）

## 工作原理

### 请求流程

1. **前端发起请求**: `fetch('/api/createWorker', { ... })`
2. **Pages Function 接收**: 捕获 `/api/createWorker` 请求
3. **构建目标 URL**: `https://cfworkerback-pages5.pages.dev/createWorker`
4. **代理请求**: 转发原始请求到后端 API
5. **添加 CORS 头部**: 在响应中添加必要的 CORS 头部
6. **返回响应**: 将处理后的响应返回给前端

### CORS 头部

函数自动添加以下 CORS 头部：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Email, X-Auth-Key, X-Account-Context
Access-Control-Max-Age: 86400
```

## 优势

1. **统一的 API 路径**: 开发和生产环境使用相同的 API 路径
2. **自动 CORS 处理**: 无需在后端 API 中配置 CORS
3. **灵活配置**: 支持通过环境变量配置目标 API
4. **完整的错误处理**: 包含详细的错误日志和响应
5. **高性能**: 利用 Cloudflare 的全球网络

## 故障排除

### 1. 检查 Pages Function 日志

在 Cloudflare Dashboard 中查看 Pages 项目的 Functions 日志。

### 2. 验证环境变量

确保 `API_TARGET` 环境变量设置正确。

### 3. 测试 API 端点

直接访问 Pages Function 端点来测试：
```
https://your-pages-domain.pages.dev/api/createWorker
```

### 4. 检查网络请求

在浏览器开发者工具中检查网络请求，确认：
- 请求路径是否正确
- 响应头是否包含 CORS 头部
- 是否有错误响应

## 扩展功能

### 添加认证

可以在 Pages Function 中添加认证逻辑：

```typescript
// 检查认证头部
const authHeader = request.headers.get('Authorization');
if (!authHeader) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 请求限制

可以添加速率限制或其他安全措施：

```typescript
// 简单的速率限制示例
const clientIP = request.headers.get('CF-Connecting-IP');
// 实现速率限制逻辑...
```

### 缓存优化

可以为某些请求添加缓存：

```typescript
// 为 GET 请求添加缓存
if (request.method === 'GET') {
  const cacheKey = new Request(finalUrl, request);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
}
```

## 总结

这个解决方案提供了一个完整的 CORS 解决方案，适用于使用 Cloudflare Pages 部署的 React 应用。它确保了开发和生产环境的一致性，同时提供了灵活的配置选项和强大的错误处理能力。 