# 🔍 Quicklink IntersectionObserver 验证指南

> 如何验证 Quicklink 使用 IntersectionObserver API 检测视口内的链接

---

## 📋 验证概述

本指南将帮助你亲身验证 Quicklink 的核心机制：**IntersectionObserver API**。

### 🎯 验证目标

1. ✅ 证明 Quicklink 只预加载**视口内**的链接
2. ✅ 证明**视口外**的链接不会被预加载（节省带宽）
3. ✅ 证明滚动时，链接进入视口会**动态触发**预加载
4. ✅ 理解 `requestIdleCallback` 如何在浏览器空闲时执行预加载

---

## 🚀 第一步：启动应用

```bash
cd apps/web-app

# 构建最新版本
pnpm run build

# 启动本地服务器
pnpm run serve

# 访问 http://localhost:65433（端口可能不同）
```

---

## 🧪 第二步：验证视口内链接（立即预加载）

### 操作步骤

1. **打开 Chrome DevTools**
   - 按 `Cmd+Option+I` (Mac) 或 `F12` (Windows/Linux)

2. **切换到 Console 面板**
   - 查找 `[PredictiveRouter]` 日志

3. **刷新页面** (`Cmd+R`)

4. **观察 Console 输出**
   ```javascript
   [PredictiveRouter] 当前路由：/
   预测路由： [
     {path: "/wallets", probability: 0.8, preloadTiming: "idle"},
     {path: "/settings", probability: 0.2, preloadTiming: "hover"}
   ]

   [PredictiveRouter] 预加载路由：/wallets (idle)
   // ✅ 这条日志证明：高概率路由被立即预加载
   ```

### 预期结果

| 链接 | 位置 | 预期行为 | Console 日志 |
|------|------|----------|--------------|
| `/wallets` | 🟢 视口内 | ✅ 立即预加载 | `预加载路由：/wallets (idle)` |
| `/settings` | 🟢 视口内 | ⏸️ hover 预加载 | 鼠标悬停时才预加载 |

### 关键观察点

**🟢 绿色区域（视口内）**：
- 页面加载时就在屏幕上可见
- Quicklink 的 IntersectionObserver 检测到这些链接
- 使用 `requestIdleCallback` 在浏览器空闲时预加载

---

## 📜 第三步：验证视口外链接（滚动时预加载）

### 操作步骤

1. **保持 DevTools Console 打开**

2. **向下滚动页面**
   - 滚动到 🟠 **橙色区域**（"视口外区域"）
   - 这个区域包含 `/transactions` 和 `/analytics` 链接

3. **观察 Console 新增日志**
   ```javascript
   // 当橙色区域进入视口时，你应该看到：
   [Quicklink] Prefetching: /transactions
   [Quicklink] Prefetching: /analytics
   ```

### 预期结果

| 操作 | 链接状态 | Console 日志 |
|------|----------|--------------|
| 页面加载时 | 🟠 视口外 | ❌ 无预加载日志 |
| 滚动到橙色区域 | 🟠 → 🟢 进入视口 | ✅ 出现预加载日志 |

### 关键观察点

**🟠 橙色区域（视口外 → 视口内）**：
- 初始时在屏幕下方，用户看不到
- IntersectionObserver 检测到它们**不在视口**，不预加载
- 滚动时，IntersectionObserver 触发 `isIntersecting: true` 回调
- 此时才开始预加载这些链接

---

## 🌐 第四步：验证 Network 面板

### 操作步骤

1. **打开 DevTools → Network 面板**

2. **刷新页面** (`Cmd+R`)

3. **筛选请求类型**
   - 在 Filter 输入框输入：`type:prefetch`
   - 或点击 Network 面板顶部的 "Other" 类型

4. **观察预加载请求**

### 预期结果

你应该看到类似的请求：

| 文件 | Type | Priority | Initiator | Size |
|------|------|----------|-----------|------|
| `wallets.chunk.js` | `prefetch` | `Lowest` | `quicklink` | ~XX KB |

**关键特征**：
- ✅ **Type**: `prefetch` 或 `script`
- ✅ **Priority**: `Lowest`（最低优先级，不阻塞主线程）
- ✅ **Initiator**: 来自 Quicklink 或 PredictiveRouter

---

## 🎨 第五步：视觉验证（页面布局）

### 页面区域说明

```
┌─────────────────────────────────────────┐
│  蓝色 Banner - 标题和说明                │
├─────────────────────────────────────────┤
│  🟢 绿色区域（视口内）                   │
│  ┌─────────┐  ┌─────────┐               │
│  │ Wallets │  │Settings │  ← 立即预加载 │
│  └─────────┘  └─────────┘               │
├─────────────────────────────────────────┤
│  紫色/粉色间隔内容                       │
│  （创建滚动距离）                        │
├─────────────────────────────────────────┤
│  白色卡片 x3                             │
│  （性能优化特性说明）                    │
├─────────────────────────────────────────┤
│  🟠 橙色区域（视口外）                   │
│  ┌───────────┐  ┌──────────┐            │
│  │Transactions│  │Analytics│ ← 滚动预加载│
│  └───────────┘  └──────────┘            │
├─────────────────────────────────────────┤
│  蓝色验证说明                            │
├─────────────────────────────────────────┤
│  灰色 Footer                             │
└─────────────────────────────────────────┘
```

---

## 💡 理解 IntersectionObserver 工作原理

### 代码逻辑（简化）

```javascript
// Quicklink 内部实现（简化版）
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // ✅ 链接进入视口
      const url = entry.target.href;

      // 使用 requestIdleCallback 在浏览器空闲时预加载
      requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      });

      // 停止观察（避免重复预加载）
      observer.unobserve(entry.target);
    }
  });
});

// 观察所有路由链接
document.querySelectorAll('a').forEach(link => {
  observer.observe(link);
});
```

### 关键 API 说明

| API | 作用 | 为什么使用 |
|-----|------|-----------|
| `IntersectionObserver` | 检测元素是否在视口内 | 避免预加载用户看不到的链接 |
| `entry.isIntersecting` | 判断元素是否可见 | 只在可见时预加载 |
| `requestIdleCallback` | 在浏览器空闲时执行 | 不阻塞主线程，不影响用户体验 |
| `<link rel="prefetch">` | 预加载资源 | 低优先级，不阻塞当前页面 |

---

## 🧩 面试回答模板

### Q1: Quicklink 如何判断链接是否在视口内？

**A**: "Quicklink 使用 IntersectionObserver API 来检测链接是否在视口内。我在项目中验证过这一点：页面初始加载时，只有视口内的链接（如 /wallets）会被立即预加载，而视口外的链接（如 /transactions）不会被预加载。当我向下滚动时，IntersectionObserver 的 isIntersecting 回调被触发，此时才开始预加载这些链接。这种机制避免了浪费带宽预加载用户可能永远不会访问的页面。"

### Q2: 为什么使用 requestIdleCallback？

**A**: "requestIdleCallback 允许我们在浏览器空闲时执行预加载，确保不会阻塞主线程。在我的验证中，即使页面正在滚动或用户正在交互，预加载也不会影响性能，因为它只在浏览器有空闲时才执行。如果浏览器不支持 requestIdleCallback，Quicklink 会降级到 setTimeout，但优先级仍然是最低的。"

### Q3: 预加载会影响当前页面性能吗？

**A**: "不会。通过 DevTools Network 面板可以看到，预加载的请求优先级是 'Lowest'，这意味着它们不会与当前页面的关键资源（如 CSS、JS）竞争带宽。在我的测试中，即使预加载了多个路由，页面的 FCP（First Contentful Paint）和 LCP（Largest Contentful Paint）指标都没有受到影响。"

---

## 🔬 高级验证（可选）

### 验证慢速网络下的行为

1. **打开 DevTools → Network 面板**
2. **切换到 "Slow 3G" 网络**
3. **刷新页面**

**预期结果**：
- ✅ Quicklink 检测到慢速网络
- ✅ 自动**禁用**预加载（避免浪费带宽）
- ✅ Console 显示：`[Quicklink] Disabled on slow connection`

### 验证 Data Saver 模式

在 Chrome 中启用 Data Saver：
1. Chrome 设置 → Advanced → Data Saver
2. 开启 Data Saver
3. 刷新页面

**预期结果**：
- ✅ Quicklink 检测到 Data Saver 模式
- ✅ 自动**禁用**预加载
- ✅ Console 显示：`[Quicklink] Disabled with Save-Data`

---

## 📊 验证检查清单

使用以下清单确保完整验证：

- [ ] ✅ 页面加载时，视口内链接被立即预加载
- [ ] ✅ 视口外链接不被预加载
- [ ] ✅ 滚动到视口外链接时，动态触发预加载
- [ ] ✅ Console 显示正确的预加载日志
- [ ] ✅ Network 面板显示 `prefetch` 类型请求
- [ ] ✅ 请求优先级为 `Lowest`
- [ ] ✅ 慢速网络下自动禁用预加载
- [ ] ✅ Data Saver 模式下自动禁用预加载

---

## 🎓 学习资源

- [IntersectionObserver API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [requestIdleCallback - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- [Resource Hints - W3C](https://www.w3.org/TR/resource-hints/)
- [Quicklink GitHub](https://github.com/GoogleChromeLabs/quicklink)

---

## 🐛 常见问题排查

### 问题：Console 没有看到预加载日志

**可能原因**：
1. Quicklink 未正确加载
2. 网络太慢，Quicklink 自动禁用
3. 浏览器启用了 Data Saver

**排查步骤**：
```javascript
// 在 Console 中运行
console.log('[Debug] 检查 Quicklink 是否加载:', typeof quicklink);
console.log('[Debug] 网络类型:', navigator.connection?.effectiveType);
console.log('[Debug] Data Saver:', navigator.connection?.saveData);
```

### 问题：视口外链接也被预加载了

**可能原因**：
- 屏幕尺寸很大，所有内容都在视口内
- 需要添加更多间隔内容

**解决方案**：
- 缩小浏览器窗口高度
- 查看橙色区域是否真的在视口外

---

**验证完成后**，你将完全理解 Quicklink 如何使用 IntersectionObserver 实现智能预加载！🎉
