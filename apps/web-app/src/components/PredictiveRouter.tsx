// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 预测式路由组件（Quicklink + 静态预测）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPredictedRoutes, shouldPrefetch } from '../routes/routeConfig';

/**
 * PredictiveRouter 组件
 *
 * 三层预加载策略：
 *
 * 1️⃣ Quicklink（视口内链接自动预加载）
 *    - 监听视口内的 <a> 标签
 *    - 用户滚动时自动预加载可见链接
 *    - 利用 IntersectionObserver API
 *    - requestIdleCallback 在浏览器空闲时执行
 *
 * 2️⃣ 静态路由预测（routeConfig.ts）
 *    - 基于业务逻辑的跳转概率
 *    - immediate：立即预加载
 *    - idle：浏览器空闲时预加载
 *
 * 3️⃣ Guess.js（ML 驱动，生产环境启用）
 *    - 基于 Google Analytics 数据训练模型
 *    - 动态预测用户下一跳路由
 *
 * 面试要点：
 * - 展示对性能优化的系统性思考
 * - 多层预加载策略：覆盖不同场景
 * - 网络感知：节省用户流量
 */

interface PredictiveRouterProps {
  children: React.ReactNode;
}

export function PredictiveRouter({ children }: PredictiveRouterProps) {
  const location = useLocation();

  useEffect(() => {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 网络条件检查（Quicklink 和静态预测都依赖）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!shouldPrefetch()) {
      console.log('[PredictiveRouter] 网络条件不佳，跳过所有预加载');
      return;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1️⃣ IntersectionObserver 监听视口内链接
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 为什么不直接使用 Quicklink 的 listen()？
     *
     * Quicklink 设计用于预加载静态资源（如 /page.html）
     * 但在 SPA 中，路由是客户端路由（如 /wallets）
     * 访问 /wallets 实际返回 index.html，不是独立文件
     *
     * 我们需要将路由映射到实际的 chunk 文件：
     * /wallets → /js/wallets.chunk.js
     *
     * 因此自己实现 IntersectionObserver 逻辑
     */
    console.log('[Quicklink] 初始化 IntersectionObserver 监听');

    // 创建 IntersectionObserver 监听链接
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute('href');

            if (href && href.startsWith('/') && !href.includes('#')) {
              console.log(`[Quicklink] 视口内检测到链接：${href}`);

              // 使用 requestIdleCallback 在浏览器空闲时预加载
              const idleCallback =
                window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1));

              idleCallback(() => {
                prefetchRoute(href, 'viewport');
              });
            }
          }
        });
      },
      {
        // rootMargin 可以提前预加载即将进入视口的链接
        rootMargin: '200px',
      },
    );

    // 延迟监听链接（等待 React 渲染完成）
    setTimeout(() => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach((link) => observer.observe(link));
      console.log(`[Quicklink] 正在监听 ${links.length} 个链接`);
    }, 100);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2️⃣ 静态路由预测
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 获取当前路由的预测路由
    const predictions = getPredictedRoutes(location.pathname);

    if (predictions.length === 0) {
      return;
    }

    console.log(`[PredictiveRouter] 当前路由：${location.pathname}`, `预测路由：`, predictions);

    // 处理 immediate 预加载
    predictions
      .filter((p) => p.preloadTiming === 'immediate')
      .forEach((prediction) => {
        prefetchRoute(prediction.path, 'immediate');
      });

    // 处理 idle 预加载
    const idlePredictions = predictions.filter((p) => p.preloadTiming === 'idle');

    if (idlePredictions.length > 0) {
      const idleCallback =
        window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1));

      idleCallback(
        () => {
          idlePredictions.forEach((prediction) => {
            prefetchRoute(prediction.path, 'idle');
          });
        },
        { timeout: 2000 },
      );
    }

    // 清理 IntersectionObserver
    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  return <>{children}</>;
}

/**
 * 预加载路由函数
 *
 * 使用 <link rel="prefetch"> 预加载资源
 *
 * Prefetch vs Preload：
 * - preload：高优先级，当前页面需要的资源
 * - prefetch：低优先级，未来可能需要的资源（适合路由预加载）
 *
 * @param path - 路由路径
 * @param timing - 预加载时机
 */
function prefetchRoute(path: string, timing: string) {
  console.log(`[PredictiveRouter] 预加载路由：${path} (${timing})`);

  // 在生产环境，Webpack 会将路由组件打包成 chunk
  // 我们通过路由路径推断 chunk 名称，并创建 prefetch link

  // 示例：/wallets → chunk 名称可能是 465.e3be4253.chunk.js
  // 实际应该从 webpack stats 或 manifest 获取准确的文件名
  // 这里简化处理，演示思路

  const chunkName = getChunkNameFromPath(path);

  // 检查是否已经预加载过
  const existingLink = document.querySelector(`link[rel="prefetch"][data-route="${path}"]`);

  if (existingLink) {
    console.log(`[PredictiveRouter] 路由已预加载：${path}`);
    return;
  }

  // 创建 prefetch link
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.setAttribute('data-route', path);

  // 这里简化处理，实际应该根据 webpack manifest 获取正确的文件名
  // 生产环境可以配合 webpack-manifest-plugin 使用
  link.href = `/js/${chunkName}.chunk.js`;

  // 添加到 head
  document.head.appendChild(link);

  // 性能监控（可选）
  if ('performance' in window && 'mark' in performance) {
    performance.mark(`prefetch-start-${path}`);
  }
}

/**
 * 从路由路径推断 chunk 名称
 *
 * 注意：这是简化实现，实际应该：
 * 1. 使用 webpack-manifest-plugin 生成 manifest.json
 * 2. 从 manifest 中查找路由对应的 chunk 文件名
 * 3. 确保文件名准确（包含 hash）
 */
function getChunkNameFromPath(path: string): string {
  // 移除参数和斜杠
  const cleanPath = path.replace(/:[^/]+/g, '').replace(/\/$/, '');

  // 路由映射
  const routeMap: Record<string, string> = {
    '/': 'home',
    '/wallets': 'wallets',
    '/wallet': 'wallet-detail',
    '/transaction': 'transaction-detail',
    '/settings': 'settings',
  };

  return routeMap[cleanPath] || 'unknown';
}
