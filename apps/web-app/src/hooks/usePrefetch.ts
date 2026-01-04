// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 预测式预加载 Hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getPredictedRoutes,
  shouldPrefetch,
  type RoutePrediction,
} from '../routes/routeConfig';

/**
 * 预测式预加载 Hook
 *
 * 工作原理：
 * 1. 监听路由变化
 * 2. 获取当前路由的预测下一跳
 * 3. 根据预加载时机策略触发预加载
 *
 * 预加载策略：
 * - immediate：立即预加载（高概率路由）
 * - idle：浏览器空闲时预加载（requestIdleCallback）
 * - hover：鼠标悬停时预加载（由组件触发，这里不处理）
 *
 * 面试要点：
 * - requestIdleCallback：不阻塞主线程
 * - Network Information API：节省用户流量
 * - Webpack dynamic import：自动 Code Splitting
 */
export function usePrefetch() {
  const location = useLocation();

  useEffect(() => {
    // 检查网络条件
    if (!shouldPrefetch()) {
      console.log('[Prefetch] 网络条件不佳，跳过预加载');
      return;
    }

    // 获取预测的下一跳路由
    const predictions = getPredictedRoutes(location.pathname);

    if (predictions.length === 0) {
      return;
    }

    console.log(
      `[Prefetch] 当前路由：${location.pathname}，预测路由：`,
      predictions,
    );

    // 处理 immediate 类型的预加载
    const immediatePredictions = predictions.filter(
      (p) => p.preloadTiming === 'immediate',
    );
    immediatePredictions.forEach((prediction) => {
      prefetchRoute(prediction);
    });

    // 处理 idle 类型的预加载
    const idlePredictions = predictions.filter(
      (p) => p.preloadTiming === 'idle',
    );

    if (idlePredictions.length > 0) {
      // 使用 requestIdleCallback 在浏览器空闲时预加载
      const idleCallback =
        window.requestIdleCallback ||
        // 兼容不支持的浏览器
        ((cb: IdleRequestCallback) => setTimeout(cb, 1));

      idleCallback(
        () => {
          idlePredictions.forEach((prediction) => {
            prefetchRoute(prediction);
          });
        },
        { timeout: 2000 }, // 最多等待 2 秒
      );
    }
  }, [location.pathname]);
}

/**
 * 预加载路由组件
 *
 * 使用 Webpack 的 magic comments 控制 chunk 名称
 * 例如：import(/* webpackChunkName: "page-home" *\/ '../pages/Home')
 *
 * @param prediction - 路由预测配置
 */
function prefetchRoute(prediction: RoutePrediction) {
  const { path, probability } = prediction;

  // 根据概率决定是否预加载（可选优化）
  if (Math.random() > probability) {
    console.log(`[Prefetch] 跳过低概率路由：${path} (${probability})`);
    return;
  }

  console.log(`[Prefetch] 预加载路由：${path} (概率: ${probability})`);

  // 预加载逻辑：通过 <link rel="prefetch"> 预加载 chunk
  // 注意：实际的组件 import 由 React.lazy 处理
  // 这里我们触发 prefetch hint，让浏览器提前下载 chunk

  // 从路由路径推断组件名称
  const componentName = getComponentNameFromPath(path);

  // 创建 prefetch link
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  // 这里简化处理，实际应该从 webpack manifest 获取准确的 chunk 文件名
  // 生产环境中可以配合 webpack-manifest-plugin 使用
  link.href = `/js/${componentName}.chunk.js`;

  // 添加到 head
  document.head.appendChild(link);
}

/**
 * 从路由路径推断组件名称
 *
 * 示例：
 * /wallets → wallets
 * /wallet/:address → wallet-detail
 * /transaction/:hash → transaction-detail
 */
function getComponentNameFromPath(path: string): string {
  // 移除参数
  const cleanPath = path.replace(/:[^/]+/g, '').replace(/\/$/, '');

  // 转换为 kebab-case
  return cleanPath
    .split('/')
    .filter(Boolean)
    .join('-')
    .toLowerCase() || 'home';
}
