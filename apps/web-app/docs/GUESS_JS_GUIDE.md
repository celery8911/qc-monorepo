# 🔮 Guess.js 启用指南

## 📌 TL;DR（快速理解）

**问题**：现在可以启用 Guess.js 吗？什么时候启用？

**答案**：✅ **已经始终启用，自动降级！**

- ❌ **没有 GA 数据**（当前状态）→ 自动降级到静态配置 + Quicklink
- ✅ **配置 GA 后**（未来）→ 自动启用 Guess.js ML 预测
- 🚀 **无需重新发版**，只需设置环境变量即可切换

---

## 🎯 自适应降级架构

### 工作流程

```
构建时（Webpack）
    ↓
检查环境变量 GUESS_GA_VIEW_ID
    ↓
┌──────────────┬──────────────┐
│  有 GA ID？   │  无 GA ID？   │
└──────────────┴──────────────┘
       ↓                ↓
   连接 GA          检查 GUESS_REPORT_URL
       ↓                ↓
   获取数据       ┌────────┬────────┐
       ↓          │  有 URL？│ 无 URL？ │
   训练模型       └────────┴────────┘
       ↓               ↓        ↓
   生成预测         从 API    返回空对象
       ↓             获取      ↓
   Guess.js        数据       Guess.js
   工作中          ↓          禁用
                Guess.js      ↓
                工作中     静态配置
                          + Quicklink
                          接管

运行时
    ↓
三层策略并行工作：
├─ Guess.js（如果有数据）
├─ 静态路由预测
└─ Quicklink
```

---

## 🚀 三种启用方式

### 方式 1：使用 Google Analytics（推荐）

**适用场景**：已有 Google Analytics 账号，希望基于真实用户行为数据

**步骤**：

1. **获取 GA View ID**

```bash
# 登录 Google Analytics
# Admin → View Settings → View ID
# 示例：123456789
```

2. **配置环境变量**

```bash
# .env 文件
GUESS_GA_VIEW_ID=123456789
```

3. **重新构建**

```bash
pnpm run build
```

4. **验证**

构建输出会显示：

```
🔮 Guess.js introduced the following prefetching instructions:

╔════════════╤════════╤═════════════╗
║ Prefetcher │ Target │ Probability ║
╠════════════╪════════╪═════════════╣
║ /home      │ /wallets │ 0.85      ║
║ /home      │ /settings│ 0.15      ║
╚════════════╧════════╧═════════════╝
```

✅ **有数据** → Guess.js 启用成功！

---

### 方式 2：使用自定义 API

**适用场景**：有自己的用户行为分析后端，不使用 Google Analytics

**步骤**：

1. **创建数据 API**

你的后端需要返回 Guess.js 兼容的数据格式：

```json
{
  "/": {
    "/wallets": 0.8,
    "/settings": 0.2
  },
  "/wallets": {
    "/wallet/:address": 0.9
  }
}
```

2. **配置环境变量**

```bash
# .env 文件
GUESS_REPORT_URL=https://api.yoursite.com/analytics/routes
```

3. **重新构建**

```bash
pnpm run build
```

---

### 方式 3：不配置（当前状态）

**适用场景**：新项目，暂无数据，使用静态配置

**当前状态**：

```bash
# .env 文件为空
# 或没有设置 GUESS_GA_VIEW_ID 和 GUESS_REPORT_URL
```

**效果**：

- ❌ Guess.js 检测到无数据，不执行预测
- ✅ 静态路由配置（`routeConfig.ts`）继续工作
- ✅ Quicklink 继续工作
- 📊 构建输出显示空表（正常）

---

## 📊 三种模式对比

| 特性 | 方式 1: GA | 方式 2: 自定义 API | 方式 3: 静态 |
|------|-----------|-------------------|-------------|
| **数据来源** | Google Analytics | 你的后端 | 人工配置 |
| **智能程度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **配置难度** | 简单（填 ID） | 中等（需开发 API） | 最简单 |
| **数据准确性** | 最高（真实用户） | 取决于你的实现 | 依赖人工分析 |
| **启动时机** | 有一定流量后 | 任何时候 | 立即可用 |
| **维护成本** | 低（GA 自动收集） | 中（需维护 API） | 高（手动调整） |

---

## 🔄 平滑迁移路径

### 阶段 1：新项目启动（当前）

```
使用：静态配置 + Quicklink
优势：零配置，立即可用
限制：基于假设，可能不准确
```

### 阶段 2：接入 Google Analytics

```bash
# 1. 在 public/index.html 添加 GA 追踪代码
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

# 2. 等待数据收集（建议 1-2 周）
# 让 GA 积累足够的用户行为数据
```

### 阶段 3：启用 Guess.js（无需改代码）

```bash
# 1. 配置环境变量
echo "GUESS_GA_VIEW_ID=123456789" > .env

# 2. 重新构建
pnpm run build

# 3. 部署
# 无需修改代码，只是重新构建
```

### 阶段 4：持续优化

```bash
# 定期（每月）重新构建，使用最新 GA 数据
pnpm run build
```

---

## 💡 面试要点

### Q: 为什么不一开始就启用 Guess.js？

**A**:

> "Guess.js 是数据驱动的 ML 模型，需要历史数据训练。新项目无数据时强行启用没有意义。
>
> 我设计了**自适应降级架构**：
> - 新项目阶段：使用静态配置（基于业务逻辑分析）+ Quicklink（自动捕获）
> - 有数据阶段：通过环境变量启用 Guess.js，无需改代码
> - 确保整个生命周期都有最佳的预加载策略"

### Q: 如果 Guess.js 和静态配置预测冲突怎么办？

**A**:

> "不会冲突，它们是**互补**的：
>
> 1. **Guess.js** 基于概率阈值（> 30%）预测全局高频路由
> 2. **静态配置** 针对特定场景（如首页 → 钱包列表）做针对性优化
> 3. **Quicklink** 捕获视口内的所有链接
>
> 即使预测了同一个路由，浏览器会自动去重，不会重复下载。
>
> 实际上，三者叠加会让预加载覆盖更全面。"

### Q: 这样做会增加构建时间吗？

**A**:

> "会有轻微影响：
>
> - **无 GA 数据**：几乎无影响（只是返回空对象）
> - **有 GA 数据**：增加 5-10 秒（下载数据 + 训练模型）
>
> 但这是**构建时成本**，不影响运行时性能。
> 而且这个成本是一次性的，部署后用户体验提升是持续的。"

---

## 🛠️ 故障排查

### 问题 1：构建时显示空表

```
╔════════════╤════════╤═════════════╗
║ Prefetcher │ Target │ Probability ║
╚════════════╧════════╧═════════════╝
（空的）
```

**原因**：
- ✅ 正常！说明 Guess.js 检测到无数据，自动降级
- 静态配置和 Quicklink 继续工作

**解决**：
- 如果想启用 Guess.js，设置 `GUESS_GA_VIEW_ID` 环境变量

---

### 问题 2：设置了 GA ID，但还是空表

**可能原因**：

1. **GA View ID 错误**

```bash
# 检查是否是纯数字
echo $GUESS_GA_VIEW_ID
# 应该输出：123456789
```

2. **GA 权限不足**

```bash
# Guess.js 需要读取 GA 数据的权限
# 确保 GA 账号有 "Read & Analyze" 权限
```

3. **GA 数据不足**

```bash
# GA 中没有足够的路由跳转数据
# 建议至少收集 1000+ 页面浏览量
```

---

### 问题 3：构建时报错 "Failed to fetch GA data"

**解决**：

```bash
# 1. 检查网络连接
curl https://www.googleapis.com

# 2. 检查 GA API 是否启用
# 登录 Google Cloud Console
# 启用 "Analytics Reporting API"

# 3. 使用自定义 API 替代（方式 2）
GUESS_REPORT_URL=https://api.yoursite.com/analytics/routes
```

---

## 📈 数据格式参考

### Guess.js 期望的数据格式

```json
{
  "/": {
    "/wallets": 0.75,
    "/settings": 0.15,
    "/wallet/:address": 0.10
  },
  "/wallets": {
    "/wallet/:address": 0.90,
    "/": 0.10
  },
  "/wallet/:address": {
    "/transaction/:hash": 0.60,
    "/wallets": 0.30,
    "/": 0.10
  }
}
```

**字段说明**：
- 外层 key：当前路由
- 内层 key：目标路由
- value：跳转概率（0-1）

---

## 🎯 总结

### 当前状态（阶段 1）

```bash
# 无需配置，已正常工作
静态配置 ✅  → routeConfig.ts
Quicklink ✅  → PredictiveRouter.tsx
Guess.js  ⚠️  → 待数据启用
```

### 未来启用（阶段 3）

```bash
# 只需一行配置
echo "GUESS_GA_VIEW_ID=123456789" > .env
pnpm run build

# 结果
静态配置 ✅  → 继续工作
Quicklink ✅  → 继续工作
Guess.js  ✅  → 自动启用！
```

### 核心优势

✅ **无需重新发版** - 环境变量控制
✅ **平滑过渡** - 自动降级机制
✅ **灵活扩展** - 支持 GA 和自定义 API
✅ **面试加分** - 展示架构设计思维

---

**下一步**：继续实现 react-snap 预渲染，完成性能优化全链路！
