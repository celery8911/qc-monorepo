// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Service Worker（临时占位，阶段4实现）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// @ts-nocheck - 先跑起来，类型检查后续完善
/// <reference lib="webworker" />

/**
 * Workbox InjectManifest 占位符
 *
 * self.__WB_MANIFEST 是一个占位符，Workbox 会在构建时：
 * 1. 扫描 dist 目录中的所有文件
 * 2. 生成文件清单（包含文件路径和 revision hash）
 * 3. 将 self.__WB_MANIFEST 替换为实际的清单数组
 *
 * 示例输出：
 * [
 *   { url: '/js/main.abc123.js', revision: null },
 *   { url: '/css/main.def456.css', revision: null }
 * ]
 */

// Workbox 预缓存清单（构建时注入）
const manifest = self.__WB_MANIFEST;

self.addEventListener('install', () => {
  console.log('Service Worker 安装中...', manifest);
  // 跳过等待，立即激活
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker 已激活');
  // 接管所有客户端
  event.waitUntil(self.clients.claim());
});
