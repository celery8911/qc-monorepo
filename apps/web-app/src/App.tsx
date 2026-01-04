// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 根组件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PredictiveRouter } from './components/PredictiveRouter';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 路由级代码分割（懒加载）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 使用 React.lazy + dynamic import 实现路由级 Code Splitting
 *
 * 原理：
 * 1. Webpack 为每个 lazy 组件生成独立的 chunk
 * 2. 用户访问路由时才加载对应的 JS 文件
 * 3. 配合 Suspense 显示加载状态
 *
 * 优点：
 * - 减小首屏 bundle 体积
 * - 提升首屏加载速度
 * - 按需加载，节省带宽
 */
const Home = lazy(() => import('./pages/Home'));
const WalletList = lazy(() => import('./pages/WalletList'));
const WalletDetail = lazy(() => import('./pages/WalletDetail'));
const TransactionDetail = lazy(() => import('./pages/TransactionDetail'));
const Settings = lazy(() => import('./pages/Settings'));

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

export default function App() {
  return (
    <BrowserRouter>
      <PredictiveRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallets" element={<WalletList />} />
            <Route path="/wallet/:address" element={<WalletDetail />} />
            <Route path="/transaction/:hash" element={<TransactionDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </PredictiveRouter>
    </BrowserRouter>
  );
}
