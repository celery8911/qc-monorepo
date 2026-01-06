// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 根组件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { withQuicklink } from 'quicklink/dist/react/hoc.js';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 路由级代码分割（懒加载）+ Quicklink 预加载
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quicklink 官方 SPA 集成方案
 *
 * 工作流程：
 * 1. webpack-route-manifest 插件生成路由到chunk的映射（rmanifest.json）
 * 2. withQuicklink HOC 包裹路由组件
 * 3. Quicklink 使用 IntersectionObserver 监听视口内的链接
 * 4. 当链接进入视口时，查询 rmanifest.json 找到对应的 chunk
 * 5. 使用 <link rel="prefetch"> 预加载 chunk 文件
 *
 * 为什么这种方式优于自己实现？
 * - 官方维护，兼容性更好
 * - 自动从 window.__rmanifest 读取映射关系
 * - 内置网络条件检测（slow-2g/save-data 模式自动禁用）
 * - 支持 requestIdleCallback 空闲时预加载
 *
 * Quicklink 配置选项：
 * - origins: 允许预加载的域名列表（空数组表示所有域名）
 */
const quicklinkOptions = {
  origins: [], // 允许所有来源的预加载
};

/**
 * 使用 React.lazy + dynamic import 实现路由级 Code Splitting
 * 并用 withQuicklink HOC 包裹，实现智能预加载
 *
 * 原理：
 * 1. Webpack 为每个 lazy 组件生成独立的 chunk
 * 2. withQuicklink 在组件挂载时启动 IntersectionObserver
 * 3. 视口内的链接会自动预加载对应的 chunk
 * 4. 用户点击时chunk已加载，实现即时响应
 *
 * 优点：
 * - 减小首屏 bundle 体积
 * - 提升首屏加载速度
 * - 按需加载，节省带宽
 * - 智能预加载，提升导航速度
 */
const Home = withQuicklink(
  lazy(() => import('./pages/Home')),
  quicklinkOptions,
);
const WalletList = withQuicklink(
  lazy(() => import('./pages/WalletList')),
  quicklinkOptions,
);
const WalletDetail = withQuicklink(
  lazy(() => import('./pages/WalletDetail')),
  quicklinkOptions,
);
const TransactionDetail = withQuicklink(
  lazy(() => import('./pages/TransactionDetail')),
  quicklinkOptions,
);
const Settings = withQuicklink(
  lazy(() => import('./pages/Settings')),
  quicklinkOptions,
);

// 加载中组件
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 主应用
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 官方 Quicklink HOC 方式 vs 之前的自定义 IntersectionObserver
 *
 * 之前的方案（PredictiveRouter 组件）：
 * - 自己实现 IntersectionObserver
 * - 手动维护路由到 chunk 的映射表
 * - 需要 setTimeout 等待 React 渲染
 * - 代码量大，维护成本高
 *
 * 官方 withQuicklink HOC 方案：
 * - webpack-route-manifest 自动生成映射
 * - withQuicklink 自动处理生命周期
 * - 无需手动延迟，HOC 在组件挂载时自动启动
 * - 代码简洁，官方维护
 *
 * 面试话术：
 * "最初为了理解原理，自己实现了 IntersectionObserver 方案。
 * 后来发现官方提供了更优雅的 HOC 方案，配合 webpack-route-manifest
 * 可以自动生成路由映射，代码更简洁且更易维护。"
 */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wallets" element={<WalletList />} />
          <Route path="/wallet/:address" element={<WalletDetail />} />
          <Route path="/transaction/:hash" element={<TransactionDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
