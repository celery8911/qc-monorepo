# Web3 钱包管理应用 - 实施计划

## 项目概述

在现有 Monorepo 基础上，构建一个展示完整前端工程能力的 Web3 钱包管理应用。这是一个**可写进简历、可用于面试讲述的项目**，涵盖性能优化、预测加载、PWA、部署验证等现代 Web 工程实践。

**技术栈确认**：
- 构建工具：Webpack 5（展示深度工程优化能力）
- 框架：React 18 + TypeScript
- 路由：React Router v6
- 状态管理：SWR + useImmer（轻量级混合方案）
- UI：复用 @qincai/ui 组件库
- 工具库：复用 @qincai/libs、@qincai/hooks

**页面规模**：5 个页面
1. 首页（/）
2. 钱包列表（/wallets）
3. 钱包详情（/wallet/:address）
4. 交易详情（/transaction/:hash）
5. 设置页（/settings）

**数据来源**：Etherscan API（免费公共 API）

---

## 实施步骤

### 阶段 1：基础项目结构搭建（第 1 天）

#### 1.1 初始化项目配置

**关键文件**：
- `apps/web-app/package.json` - 依赖管理
- `apps/web-app/tsconfig.json` - TypeScript 配置（继承 tsconfig.base.json）
- `apps/web-app/tailwind.config.js` - Tailwind CSS 配置

**安装核心依赖**：
```bash
cd apps/web-app
pnpm add react react-dom react-router-dom swr localforage quicklink web3
pnpm add -D webpack webpack-cli webpack-dev-server html-webpack-plugin \
  mini-css-extract-plugin css-loader style-loader postcss-loader \
  compression-webpack-plugin @squoosh/webpack-plugin \
  workbox-webpack-plugin typescript @babel/core \
  @babel/preset-env @babel/preset-react @babel/preset-typescript
```

#### 1.2 创建目录结构

```
apps/web-app/
├── public/
│   ├── index.html
│   ├── manifest.json (PWA 配置)
│   └── offline.html (离线降级页)
├── src/
│   ├── index.tsx (入口文件)
│   ├── App.tsx (根组件)
│   ├── pages/ (5 个页面组件)
│   ├── components/ (业务组件)
│   ├── hooks/ (自定义 Hooks)
│   ├── services/ (API 层)
│   ├── routes/ (路由配置)
│   ├── workers/ (Service Worker)
│   ├── styles/ (全局样式)
│   └── types/ (类型定义)
├── webpack/
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   ├── webpack.prod.js
│   └── plugins/
│       └── InlineCriticalCssPlugin.js (自定义插件)
├── nginx/
│   └── nginx.conf
└── scripts/
    └── verify-deployment.sh
```

---

### 阶段 2：Webpack 核心配置（第 2 天）

#### 2.1 配置 webpack.common.js

**关键点**：
- Entry/Output 配置（contenthash 文件名）
- Module 别名（@qincai/* 指向 monorepo packages）
- Babel Loader 配置（React + TypeScript）
- CSS Loader 链（PostCSS + Tailwind）
- Asset Modules（图片、字体）

**文件位置**：`apps/web-app/webpack/webpack.common.js`

#### 2.2 配置 webpack.prod.js - **核心优化**

**必须实现的优化**：

1. **Code Splitting 策略**（6 层拆分）：
   ```javascript
   optimization: {
     splitChunks: {
       cacheGroups: {
         reactVendor: {}, // React 核心
         web3Vendor: {},  // Web3 库
         utilsVendor: {}, // SWR、localforage
         monorepoShared: {}, // @qincai/* 包
         defaultVendors: {}, // 其他 node_modules
         common: {} // 公共代码
       }
     }
   }
   ```

2. **压缩配置**：
   - Gzip 压缩（CompressionWebpackPlugin）
   - Brotli 压缩（优先级高于 Gzip）
   - 图片优化（SquooshWebpackPlugin，自动生成 WebP）

3. **Service Worker 生成**：
   - 使用 workbox-webpack-plugin
   - InjectManifest 模式（自定义 SW 逻辑）

4. **自定义插件**：InlineCriticalCssPlugin
   - 提取首屏 CSS 内联到 HTML
   - 其余 CSS 异步加载（preload）

**文件位置**：`apps/web-app/webpack/webpack.prod.js`

**为什么选择 Webpack 而不是 Vite**：
- 更深度的构建控制（展示工程能力）
- 更多企业级实践案例
- 面试加分项（理解复杂配置）

#### 2.3 配置 webpack.dev.js

- React Fast Refresh
- DevServer 配置（HMR、History API Fallback）
- eval-cheap-module-source-map（快速重建 + 行号）

**文件位置**：`apps/web-app/webpack/webpack.dev.js`

---

### 阶段 3：路由与预测加载（第 3 天）

#### 3.1 实现路由配置

**文件位置**：`apps/web-app/src/routes/index.tsx`

使用 React Router v6 + React.lazy 实现路由级 Code Splitting：
```typescript
const Home = lazy(() => import('../pages/Home'));
const WalletList = lazy(() => import('../pages/WalletList'));
// ...其他页面
```

#### 3.2 实现预测式路由（PredictiveRouter）

**文件位置**：`apps/web-app/src/routes/PredictiveRouter.tsx`

**功能**：
- 集成 Quicklink（自动预加载视口内链接）
- 配置网络条件判断（仅在快速网络预加载）
- 使用 requestIdleCallback（不阻塞主线程）

**何时初始化**：页面加载完成且浏览器空闲时

#### 3.3 实现基于路由关系的预测逻辑

**文件位置**：
- `apps/web-app/src/routes/routeConfig.ts` - 路由关系配置
- `apps/web-app/src/hooks/usePrefetch.ts` - 预测加载 Hook

使用 Quicklink 进行预加载
使用 Guess.js 进行智能预测
实现预渲染

**路由预测规则**：
```
Home → WalletList (80%)
WalletList → WalletDetail (90%)
WalletDetail → TransactionDetail (60%)
```

---

### 阶段 4：PWA 与离线能力（第 4 天）

#### 4.1 实现 Service Worker

**文件位置**：`apps/web-app/src/workers/service-worker.ts`

**缓存策略设计**（Workbox）：

| 资源类型 | 策略 | 原因 | 过期时间 |
|---------|------|------|---------|
| 静态资源 (JS/CSS) | Cache First | 带 hash，永不过期 | 1 年 |
| 图片 | Stale While Revalidate | 容忍短暂过期 | 30 天 |
| API 数据 | Network First | 需要实时性，离线降级 | 5 分钟 |
| HTML | Network First | 优先最新版本 | - |

**离线降级页面**：
- 创建 `public/offline.html`
- 在 install 事件中预缓存
- 网络失败时显示

#### 4.2 Service Worker 注册

**文件位置**：`apps/web-app/src/index.tsx`

- 在 window.load 事件中注册
- 监听 updatefound 事件（提示用户刷新）

#### 4.3 localForage 集成

**文件位置**：`apps/web-app/src/services/cache.ts`

**使用场景**：
- 用户偏好设置（主题、语言）
- 本地钱包地址列表
- 钱包详情离线缓存

**为什么需要 localForage**（Service Worker Cache 不够吗）：
- Service Worker Cache 主要缓存 HTTP 请求/响应
- localForage 提供简单的 Key-Value API
- 更适合存储应用状态和用户数据

---

### 阶段 5：API 层与数据管理（第 5 天）

#### 5.1 配置 Etherscan API

**文件位置**：
- `apps/web-app/src/services/api.ts` - API 客户端
- `apps/web-app/src/services/etherscan.ts` - Etherscan 封装
- `apps/web-app/src/services/types.ts` - 响应类型

**API Endpoints**：
- 获取余额：`https://api.etherscan.io/api?module=account&action=balance&address=ADDRESS`
- 获取交易：`https://api.etherscan.io/api?module=account&action=txlist&address=ADDRESS`
- 交易详情：`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=TX_HASH`

**免费 API Key**：https://etherscan.io/myapikey（每秒 5 次请求）

#### 5.2 实现自定义 Hooks

在qc-hooks增加
1. **useWallets.ts** - 钱包列表管理
   - 使用 `@qincai/hooks` 的 useImmer（本地状态）
   - 使用 SWR（服务端数据缓存）
   - 使用 localForage（持久化）

**文件位置**：`apps/web-app/src/hooks/`

**关键 Hooks**：

2. **useWalletDetail.ts** - 钱包详情
   - SWR 配置（5 分钟重新验证）
   - 离线降级到 localForage 缓存

3. **usePrefetch.ts** - 预测加载逻辑
   - 根据 routeConfig 自动预加载

4. **useOfflineStatus.ts** - 离线状态检测
   - 监听 online/offline 事件
   - 显示离线提示

---

### 阶段 6：页面组件实现（第 6-7 天）

#### 6.1 首页（/）

**文件位置**：`apps/web-app/src/pages/Home/index.tsx`

**使用组件**：
- `@qincai/ui/Card` - 功能卡片
- `@qincai/ui/Button` - 导航按钮

**性能优化**：
- 内联首屏 CSS（InlineCriticalCssPlugin）
- 预加载 WalletList（usePrefetch）

#### 6.2 钱包列表（/wallets）

**文件位置**：`apps/web-app/src/pages/WalletList/index.tsx`

**功能**：
- 展示钱包列表（使用 `@qincai/libs/formatAddress`）
- 添加钱包（Dialog 弹窗）
- 删除钱包

**使用组件**：
- `@qincai/ui/Card`
- `@qincai/ui/Dialog`
- `@qincai/ui/Button`
- `@qincai/hooks/useImmer`

**性能优化**：
- 虚拟滚动（react-window，如果钱包数量多）
- 预加载 WalletDetail

#### 6.3 钱包详情（/wallet/:address）

**文件位置**：`apps/web-app/src/pages/WalletDetail/index.tsx`

**功能**：
- 显示余额（ETH + USD）
- 交易记录列表（最近 10 笔）
- 地址复制功能

**性能优化**：
- SWR 缓存（5 分钟）
- 预加载 TransactionDetail

#### 6.4 交易详情（/transaction/:hash）

**文件位置**：`apps/web-app/src/pages/TransactionDetail/index.tsx`

**功能**：
- 交易哈希、发送方、接收方
- 交易金额、Gas 费用
- 区块高度、时间戳

**性能优化**：
- Cache First（交易数据不可变）

#### 6.5 设置页（/settings）

**文件位置**：`apps/web-app/src/pages/Settings/index.tsx`

**功能**：
- PWA 安装提示
- 缓存管理（清除按钮）
- 主题切换

**性能优化**：
- 懒加载（独立 chunk）

---

### 阶段 7：部署与验证（第 8 天）

#### 7.1 配置 Nginx

**文件位置**：`apps/web-app/nginx/nginx.conf`

**必须配置**：
- HTTP/2（`listen 443 ssl http2;`）
- HTTP/3（`listen 443 quic;`，需要编译支持）
- Brotli 压缩（优先级高于 Gzip）
- 缓存策略：
  - 静态资源：`Cache-Control: public, max-age=31536000, immutable`
  - HTML：`Cache-Control: no-cache` + ETag
  - Service Worker：`Cache-Control: no-cache, no-store`
- SPA 路由支持（`try_files $uri $uri/ /index.html`）

**如何启用 HTTP/3**：
- 需要编译 Nginx（--with-http_v3_module）
- 需要 OpenSSL 1.1.1+ 或 BoringSSL

#### 7.2 验证流程

**文件位置**：`apps/web-app/scripts/verify-deployment.sh`

**验证步骤**：
1. 构建生产版本（`pnpm run build`）
2. 启动 Nginx（`nginx -c $(pwd)/nginx/nginx.conf`）
3. 验证 HTTP/2（`curl -I --http2 https://localhost`）
4. 验证压缩（检查 Content-Encoding: br/gzip）
5. 验证缓存策略（检查 Cache-Control 头）
6. 运行 Lighthouse（目标 Performance > 90）

#### 7.3 Chrome DevTools 验证

**Network 面板**：
- 检查 Protocol 列（h2/h3）
- 检查 Content-Encoding（br/gzip）
- 对比 Size 和 Transferred

**Performance 面板**：
- 录制首屏加载
- 分析 Long Tasks
- 验证 Code Splitting 生效

**Coverage 面板**：
- 检测未使用代码
- 优化 vendor chunk

---

### 阶段 8：性能调试演示（第 9 天）

#### 8.1 创建性能问题组件

**文件位置**：`apps/web-app/src/components/PerformanceDemo/SlowComponent.tsx`

**目的**：故意创建性能问题，用于演示如何通过 DevTools 定位并优化

**问题**：
- 同步阻塞主线程（斐波那契递归）
- 每次渲染都重新计算
- 未使用 memo/useMemo

#### 8.2 SourceMap 配置

**Webpack devtool**：
- 开发环境：`eval-cheap-module-source-map`（快速重建 + 行号）
- 生产环境：`hidden-source-map`（生成但不暴露）

**验证**：
- DevTools Sources 面板显示完整路径
- 可以跳转到 monorepo package 源码
- 可以打断点调试

#### 8.3 Chrome DevTools MCP 配置（可选）

**配置文件**：`.mcp/config.json`

**用途**：
- 让 AI 助手直接分析性能数据
- 自动生成优化建议

---

## 关键文件清单

### 必须创建的文件（按优先级排序）

1. **Webpack 配置**（核心）：
   - `apps/web-app/webpack/webpack.common.js`
   - `apps/web-app/webpack/webpack.prod.js` ⭐ 面试重点
   - `apps/web-app/webpack/webpack.dev.js`
   - `apps/web-app/webpack/plugins/InlineCriticalCssPlugin.js`

2. **Service Worker**（PWA）：
   - `apps/web-app/src/workers/service-worker.ts` ⭐ 面试重点

3. **路由与预测加载**：
   - `apps/web-app/src/routes/index.tsx`
   - `apps/web-app/src/routes/PredictiveRouter.tsx` ⭐ 面试重点
   - `apps/web-app/src/routes/routeConfig.ts`

4. **API 与数据管理**：
   - `apps/web-app/src/services/api.ts`
   - `apps/web-app/src/services/etherscan.ts`
   - `apps/web-app/src/services/cache.ts`
   - `apps/web-app/src/hooks/useWallets.ts` ⭐ 面试重点

5. **Nginx 配置**：
   - `apps/web-app/nginx/nginx.conf` ⭐ 面试重点

6. **页面组件**（5 个）：
   - `apps/web-app/src/pages/Home/index.tsx`
   - `apps/web-app/src/pages/WalletList/index.tsx`
   - `apps/web-app/src/pages/WalletDetail/index.tsx`
   - `apps/web-app/src/pages/TransactionDetail/index.tsx`
   - `apps/web-app/src/pages/Settings/index.tsx`

7. **入口文件**：
   - `apps/web-app/src/index.tsx`
   - `apps/web-app/src/App.tsx`
   - `apps/web-app/public/index.html`
   - `apps/web-app/public/manifest.json`

8. **配置文件**：
   - `apps/web-app/package.json`
   - `apps/web-app/tsconfig.json`
   - `apps/web-app/tailwind.config.js`
   - `apps/web-app/.babelrc`

---

## 面试讲述路径

### 1 分钟版本

"这是一个基于 Monorepo 的 Web3 钱包管理应用。我使用 Webpack 而不是 Vite，是为了展示更深度的工程优化能力。项目实现了完整的性能优化链路：通过自定义 Webpack 插件内联首屏 CSS，配置 6 层 Code Splitting 策略拆分 vendor 包，使用 Workbox 实现离线优先的 PWA，结合 Quicklink 和自定义预测逻辑实现智能预加载。最终通过 Nginx 配置 HTTP/2、Brotli 压缩和缓存策略，Lighthouse Performance 评分达到 90+。"

### 3 分钟版本

**架构设计**：
"采用路由级 Code Splitting，每个页面都是独立 chunk。状态管理使用 SWR + useImmer 的混合方案，避免引入 Redux 的复杂性。复用 Monorepo 中的 @qincai/ui 组件库、@qincai/libs 工具库，通过 TypeScript Path Mapping 实现开发时的 HMR。"

**性能优化**：
"首屏优化方面，我开发了一个 Webpack 插件 InlineCriticalCssPlugin，在构建时提取首屏 CSS 内联到 HTML，其余样式异步加载。Code Splitting 策略分 6 层：React 核心、Web3 库、工具库、Monorepo 共享包、其他 vendor、公共代码，配合 contenthash 实现长期缓存。"

"预测加载方面，集成 Quicklink 自动预加载视口内链接，同时基于业务场景配置了路由跳转概率，比如 WalletList 页面有 90% 概率跳转到 WalletDetail，会提前预加载对应的 chunk。"

"PWA 方面，使用 Workbox 实现三种缓存策略：静态资源 Cache First、API 数据 Network First、图片 Stale While Revalidate。配合 localForage 持久化用户数据，实现完整的离线能力。"

**验证结果**：
"通过 Nginx 配置 HTTP/2 + Brotli 压缩，gzip 压缩率约 70%，Brotli 可达 80%。配置强缓存（1 年）和协商缓存（ETag），本地验证脚本自动检测所有优化项。Lighthouse Performance 评分 90+，PWA 100 分。"

### 5 分钟版本（技术深度）

在 3 分钟版本基础上，补充：

**为什么选择 Webpack**：
"相比 Vite，Webpack 提供了更深度的构建控制。比如自定义 InlineCriticalCssPlugin，需要 Hook 到 HtmlWebpackPlugin 的 compilation 流程，读取生成的 CSS 资源，动态修改 HTML。这展示了对 Webpack 插件机制的理解，包括 Compiler Hooks、Compilation Hooks 的生命周期。"

**为什么不用 Guess.js**：
"Guess.js 需要 Google Analytics 历史数据训练预测模型，配置复杂且对新项目不适用。我采用了简化方案：基于业务逻辑静态配置路由跳转概率，配合 React.lazy 的 dynamic import 实现预加载。这更实用，也更容易维护。"

**为什么需要 localForage**：
"Service Worker Cache 主要缓存 HTTP 请求/响应，API 相对底层。localForage 提供简单的 Key-Value API，自动选择最佳存储（IndexedDB > WebSQL > localStorage），更适合存储应用状态和用户数据。两者配合使用，Cache 负责网络资源，localForage 负责应用数据。"

**SourceMap 定位 Monorepo 问题**：
"开发环境使用 eval-cheap-module-source-map，保留行号且快速重建。生产环境使用 hidden-source-map，生成 SourceMap 但不暴露给用户。通过 Webpack alias 配置，DevTools Sources 面板会显示完整路径，比如 `webpack://web-app/../../packages/qc-hooks/src/useImmer.ts`，可以直接定位到 Monorepo 中的具体 package 并打断点调试。"

---

## 技术选型理由总结

| 技术 | 选择 | 理由 |
|------|------|------|
| 构建工具 | Webpack 5 | 深度控制、自定义插件、面试加分 |
| 状态管理 | SWR + useImmer | 轻量级、避免 Redux 复杂性 |
| 预测加载 | Quicklink + 自定义 | 简单实用、不依赖历史数据 |
| PWA | Workbox | 官方推荐、多种缓存策略 |
| 本地存储 | localForage | 简单 API、自动选择最佳存储 |
| 压缩 | Brotli + Gzip | Brotli 压缩率更高（优先） |
| 协议 | HTTP/2 + HTTP/3 | 多路复用、更快的连接建立 |

---

## 预期成果

1. **可运行的完整应用**：
   - 5 个页面全部实现
   - 实时余额查询、交易记录展示
   - 离线可用（PWA）

2. **可验证的性能指标**：
   - Lighthouse Performance > 90
   - 首屏加载 < 2s（3G 网络）
   - 资源压缩率 > 70%（Brotli）

3. **可演示的工程能力**：
   - 自定义 Webpack 插件
   - 完整的缓存策略
   - SourceMap 调试 Monorepo

4. **可讲述的面试素材**：
   - 每个技术选型都有明确理由
   - 展示对性能优化的深度理解
   - 体现工程化思维

---

## 备注

- **时间估算**：9 个工作日（不包括深入优化）
- **难点**：HTTP/3 配置（需要编译 Nginx）、自定义 Webpack 插件
- **可选项**：Chrome DevTools MCP 配置、虚拟滚动（钱包数量少时不需要）
- **API 限制**：Etherscan 免费 API 每秒 5 次请求，需要注意频率控制
