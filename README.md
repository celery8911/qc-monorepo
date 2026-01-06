# QinCai Monorepo

一个基于 pnpm workspace + Turbo 的现代化前端工程化 Monorepo 项目，包含共享组件库和 Web3 应用。

## 项目结构

```
qc-monorepo/
├── apps/                      # 应用目录
│   ├── web-app/              # Web3 钱包管理应用
│   └── qc-ui-interface/      # UI 组件展示应用
├── packages/                  # 共享包目录
│   ├── qc-ui/                # UI 组件库
│   ├── qc-hooks/             # React Hooks 工具库
│   └── qc-libs/              # 通用工具函数库
├── .changeset/               # Changesets 版本管理
├── package.json              # 根配置文件
├── pnpm-workspace.yaml       # pnpm workspace 配置
└── turbo.json                # Turbo 构建配置
```

## 技术栈

### 包管理与构建
- **pnpm workspace** - 高效的 Monorepo 包管理工具
- **Turbo** - 高性能的 Monorepo 任务编排工具
- **Changesets** - 自动化版本管理和发布工具

### 共享包技术栈
- **@qincai/ui** - React 18+ | TypeScript | Tailwind CSS 4 | Vite
- **@qincai/hooks** - React 18+ | TypeScript | Immer | Rollup
- **@qincai/libs** - TypeScript | Microbundle

### 应用技术栈
- **web-app** - React 18+ | TypeScript | Webpack 5 | Tailwind CSS 4 | Web3.js | PWA

## 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8.6.2

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
# 启动所有应用的开发服务器
pnpm dev

# 启动特定应用
pnpm --filter web-app dev
pnpm --filter qc-ui-interface dev
```

### 构建
```bash
# 构建所有包和应用
pnpm build

# 构建特定包
pnpm --filter @qincai/ui build
pnpm --filter @qincai/hooks build
pnpm --filter @qincai/libs build

# 构建特定应用
pnpm --filter web-app build
```

## 共享包说明

### @qincai/ui
UI 组件库，基于 React + Tailwind CSS 构建的可复用组件集合。

**特性：**
- TypeScript 类型支持
- Tailwind CSS 4 样式系统
- Radix UI 无障碍组件
- Vite 构建优化

**安装使用：**
```bash
pnpm add @qincai/ui
```

```tsx
import { Button, Dialog } from '@qincai/ui';

function App() {
  return <Button variant="primary">Click me</Button>;
}
```

### @qincai/hooks
React Hooks 工具库，提供常用的自定义 Hooks。

**特性：**
- TypeScript 完整类型支持
- 集成 Immer 实现不可变状态管理
- useImmer - 基于 Immer 的状态管理 Hook
- Rollup 优化打包

**安装使用：**
```bash
pnpm add @qincai/hooks
```

```tsx
import { useImmer } from '@qincai/hooks';

function TodoList() {
  const [todos, updateTodos] = useImmer([
    { id: 1, text: 'Learn React', done: false }
  ]);

  const toggleTodo = (id: number) => {
    updateTodos(draft => {
      const todo = draft.find(t => t.id === id);
      if (todo) todo.done = !todo.done;
    });
  };

  return (/* ... */);
}
```

### @qincai/libs
通用工具函数库，包含常用的工具函数。

**特性：**
- TypeScript 完整类型定义
- Tree-shaking 友好（sideEffects: false）
- 零依赖
- Microbundle 打包优化

**安装使用：**
```bash
pnpm add @qincai/libs
```

```tsx
import { formatAddress } from '@qincai/libs';

const address = '0x1234567890abcdef1234567890abcdef12345678';
console.log(formatAddress(address)); // "0x1234...5678"
```

## 应用说明

### web-app - Web3 钱包管理应用
一个完整的 Web3 钱包管理应用，展示了现代前端工程化的最佳实践。

**核心功能：**
- 钱包管理与查看
- 交易历史记录
- Web3.js 区块链交互
- PWA 离线支持
- 性能优化实践

**技术亮点：**
- Webpack 5 高级配置（Code Splitting、Tree Shaking、Compression）
- Guess.js 智能预测式加载
- Quicklink 视口内链接预加载
- Service Worker 离线缓存策略
- Google Analytics 数据分析集成
- SWR 数据请求缓存

**性能优化：**
- 路由级 Code Splitting
- Brotli + Gzip 双重压缩
- 6 层 splitChunks 策略
- Hidden Source Map（生产环境）
- 预测式资源预加载

**开发命令：**
```bash
cd apps/web-app

# 开发
pnpm dev              # 启动开发服务器（http://localhost:8080）

# 构建
pnpm build            # 生产构建
pnpm build:test       # 测试环境构建（使用测试 GA ID）
pnpm build:debug      # 调试模式构建

# 预览
pnpm serve            # 预览生产构建（http://localhost:3000）

# 类型检查
pnpm type-check       # TypeScript 类型检查
```

**技术文档：**
- [预测式加载实现指南](apps/web-app/PREDICTIVE_LOADING.md)
- [Guess.js 集成指南](apps/web-app/GUESS_JS_GUIDE.md)
- [性能验证指南](apps/web-app/VERIFICATION_GUIDE.md)

## 版本管理与发布

本项目使用 Changesets 进行版本管理和发布。

### 添加变更记录
```bash
pnpm changeset
```

执行后会提示：
1. 选择变更的包
2. 选择版本类型（major/minor/patch）
3. 填写变更说明

### 更新版本号
```bash
pnpm version-packages
```

自动更新所有包的版本号和依赖关系。

### 发布包
```bash
# 发布到 npm（需要登录 npm）
pnpm release

# 发布到本地 Verdaccio（测试用）
pnpm release:local
```

## Turbo 任务编排

Turbo 配置文件：`turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],    // 依赖包先构建
      "outputs": ["dist/**"]      // 缓存输出目录
    },
    "dev": {
      "cache": false              // 开发模式不缓存
    },
    "lint": {
      "outputs": []               // Lint 无输出文件
    }
  }
}
```

**Turbo 优势：**
- 智能增量构建（只构建变更的包）
- 任务依赖管理（自动处理构建顺序）
- 本地缓存（加速重复构建）
- 并行执行任务（提升构建速度）

## 工作流程

### 开发新功能
```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发（自动热更新）
pnpm dev

# 3. 构建测试
pnpm build

# 4. 添加变更记录
pnpm changeset

# 5. 提交代码
git add .
git commit -m "feat: add new feature"
git push
```

### 发布新版本
```bash
# 1. 更新版本号
pnpm version-packages

# 2. 提交版本变更
git add .
git commit -m "chore: release packages"

# 3. 构建并发布
pnpm release
```

## 项目配置文件

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

定义 workspace 包的位置。

### .npmrc
```ini
registry=https://registry.npmmirror.com
strict-peer-dependencies=false
auto-install-peers=true
shamefully-hoist=false
```

配置 pnpm 行为和 npm registry。

### tsconfig.base.json
根级 TypeScript 配置，所有包继承此配置。

## 目录详解

### packages/qc-ui
```
qc-ui/
├── src/
│   ├── components/         # 组件源码
│   │   ├── Button.tsx
│   │   └── Dialog.tsx
│   ├── index.ts            # 入口文件
│   └── types.ts            # 类型定义
├── dist/                   # 构建输出
├── package.json
├── tsconfig.json
└── vite.config.ts          # Vite 配置
```

### packages/qc-hooks
```
qc-hooks/
├── src/
│   ├── useImmer.ts         # useImmer Hook
│   ├── index.ts            # 入口文件
│   └── types.ts            # 类型定义
├── dist/                   # 构建输出
├── package.json
├── tsconfig.json
└── rollup.config.js        # Rollup 配置
```

### packages/qc-libs
```
qc-libs/
├── src/
│   ├── format.ts           # 格式化工具
│   ├── index.ts            # 入口文件
│   └── types.ts            # 类型定义
├── dist/                   # 构建输出
├── package.json
└── tsconfig.json
```

### apps/web-app
```
web-app/
├── src/
│   ├── pages/              # 页面组件
│   ├── components/         # 公共组件
│   ├── routes/             # 路由配置
│   ├── workers/            # Service Worker
│   ├── styles/             # 样式文件
│   └── App.tsx             # 根组件
├── webpack/                # Webpack 配置
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
├── dist/                   # 构建输出
├── public/                 # 静态资源
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 常见问题

### 1. 包之间如何相互引用？
使用 `workspace:*` 协议：
```json
{
  "dependencies": {
    "@qincai/hooks": "workspace:*"
  }
}
```

### 2. 如何调试共享包？
开发模式下，共享包使用源码（`src/index.ts`），修改后自动生效：
```json
{
  "main": "./src/index.ts",  // 开发时使用源码
  "publishConfig": {
    "main": "./dist/index.js"  // 发布时使用构建产物
  }
}
```

### 3. 如何只构建变更的包？
Turbo 自动检测变更：
```bash
pnpm build  # 只构建有变更的包
```

### 4. 如何清理所有构建产物？
```bash
# 清理 node_modules
pnpm -r exec rm -rf node_modules
rm -rf node_modules

# 清理构建产物
pnpm -r exec rm -rf dist
```

### 5. 如何测试本地包发布？
使用 Verdaccio 本地 npm 仓库：
```bash
# 启动 Verdaccio
npx verdaccio

# 发布到本地仓库
pnpm release:local
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'feat: add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### Commit 规范
遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具相关

## License

ISC

## 相关链接

- [pnpm Workspace 文档](https://pnpm.io/workspaces)
- [Turbo 文档](https://turbo.build/)
- [Changesets 文档](https://github.com/changesets/changesets)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Web3.js 文档](https://web3js.org/)
