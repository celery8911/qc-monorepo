// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Quicklink TypeScript 类型声明
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quicklink 官方包没有提供完整的 TypeScript 类型定义
 * 这里手动声明必要的类型
 */

declare module 'quicklink/dist/react/hoc.js' {
  import { ComponentType, LazyExoticComponent } from 'react';

  /**
   * Quicklink HOC 配置选项
   */
  export interface QuicklinkOptions {
    /**
     * 允许预加载的域名列表
     * - 空数组：允许所有域名
     * - 默认：[window.location.origin] 仅同域
     */
    origins?: string[];

    /**
     * 忽略特定 URL 的预加载
     * 可以是正则表达式或函数
     */
    ignores?: (RegExp | ((uri: string, elem: HTMLAnchorElement) => boolean))[];

    /**
     * 预加载超时时间（毫秒）
     */
    timeout?: number;

    /**
     * 并发预加载数量限制
     */
    throttle?: number;

    /**
     * 网络条件限制
     * - 默认：检测 navigator.connection.saveData 和 effectiveType
     */
    priority?: boolean;
  }

  /**
   * withQuicklink 高阶组件
   *
   * 用法：
   * ```ts
   * const Home = withQuicklink(lazy(() => import('./pages/Home')), options);
   * ```
   *
   * @param Component - React 懒加载组件
   * @param options - Quicklink 配置选项
   * @returns 包裹后的组件
   */
  export function withQuicklink<P = {}>(
    Component: LazyExoticComponent<ComponentType<P>>,
    options?: QuicklinkOptions,
  ): ComponentType<P>;
}
