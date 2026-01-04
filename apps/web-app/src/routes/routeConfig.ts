// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 路由配置 - 预测式加载核心
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 路由预测逻辑
 *
 * 为什么需要路由预测？
 * - 传统 Code Splitting：用户点击时才加载 → 有 100-300ms 延迟
 * - 预测式加载：基于用户行为提前加载 → 点击时立即响应
 *
 * 为什么不用 Guess.js？
 * - Guess.js 需要 Google Analytics 历史数据训练模型
 * - 新项目无历史数据，配置复杂
 * - 采用简化方案：静态配置路由跳转概率
 *
 * 面试加分点：
 * - 展示对用户体验的深度思考
 * - 理解预测式加载的业务价值
 */

export interface RouteConfig {
  path: string; // 路由路径
  componentPath: string; // 组件路径（用于动态 import）
  predictions?: RoutePrediction[]; // 预测的下一跳路由
}

export interface RoutePrediction {
  path: string; // 目标路由路径
  probability: number; // 跳转概率（0-1）
  preloadTiming?: 'immediate' | 'idle' | 'hover'; // 预加载时机
}

/**
 * 路由配置映射表
 *
 * 业务逻辑分析：
 * 1. Home → WalletList (80%)
 *    - 用户进入首页后最可能去查看钱包列表
 *
 * 2. WalletList → WalletDetail (90%)
 *    - 钱包列表页的主要操作就是查看详情
 *
 * 3. WalletDetail → TransactionDetail (60%)
 *    - 钱包详情页展示交易记录，用户可能点击查看
 *
 * 4. Settings 独立，低优先级预加载
 */
export const routeConfigs: Record<string, RouteConfig> = {
  home: {
    path: '/',
    componentPath: '../pages/Home',
    predictions: [
      {
        path: '/wallets',
        probability: 0.8,
        preloadTiming: 'idle', // 浏览器空闲时预加载
      },
      {
        path: '/settings',
        probability: 0.2,
        preloadTiming: 'hover', // 鼠标悬停时预加载
      },
    ],
  },

  wallets: {
    path: '/wallets',
    componentPath: '../pages/WalletList',
    predictions: [
      {
        path: '/wallet/:address',
        probability: 0.9,
        preloadTiming: 'hover', // 鼠标悬停钱包卡片时预加载
      },
    ],
  },

  walletDetail: {
    path: '/wallet/:address',
    componentPath: '../pages/WalletDetail',
    predictions: [
      {
        path: '/transaction/:hash',
        probability: 0.6,
        preloadTiming: 'hover', // 鼠标悬停交易记录时预加载
      },
      {
        path: '/wallets',
        probability: 0.3,
        preloadTiming: 'immediate', // 返回列表页，立即预加载
      },
    ],
  },

  transactionDetail: {
    path: '/transaction/:hash',
    componentPath: '../pages/TransactionDetail',
    predictions: [
      {
        path: '/wallet/:address',
        probability: 0.7,
        preloadTiming: 'immediate', // 返回钱包详情，立即预加载
      },
    ],
  },

  settings: {
    path: '/settings',
    componentPath: '../pages/Settings',
    predictions: [
      {
        path: '/',
        probability: 0.6,
        preloadTiming: 'immediate', // 返回首页，立即预加载
      },
    ],
  },
};

/**
 * 根据当前路由获取预测的下一跳路由
 *
 * @param currentPath - 当前路由路径
 * @returns 预测的路由配置数组
 */
export function getPredictedRoutes(currentPath: string): RoutePrediction[] {
  // 匹配路由配置（处理动态路由参数）
  const routeKey = Object.keys(routeConfigs).find((key) => {
    const config = routeConfigs[key];
    // 简单匹配：/wallet/:address 匹配 /wallet/0x123...
    const regex = new RegExp(
      '^' + config.path.replace(/:[^/]+/g, '[^/]+') + '$',
    );
    return regex.test(currentPath);
  });

  if (!routeKey) {
    return [];
  }

  return routeConfigs[routeKey].predictions || [];
}

/**
 * 网络条件判断
 *
 * 仅在快速网络下预加载，避免浪费用户流量
 * - 4G/WiFi：允许预加载
 * - 3G/2G/节省流量模式：禁用预加载
 */
export function shouldPrefetch(): boolean {
  // @ts-ignore - navigator.connection 是实验性 API
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    // 浏览器不支持 Network Information API，默认允许
    return true;
  }

  // 检查节省流量模式
  if (connection.saveData) {
    return false;
  }

  // 检查网络类型
  const effectiveType = connection.effectiveType;
  if (effectiveType === '2g' || effectiveType === 'slow-2g') {
    return false;
  }

  return true;
}
