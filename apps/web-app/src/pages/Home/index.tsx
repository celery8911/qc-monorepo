// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 首页组件（Quicklink IntersectionObserver 验证演示）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 顶部 Banner */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Web3 钱包管理中心</h1>
          <p className="text-xl mb-8">🔍 Quicklink IntersectionObserver 验证演示</p>
          <div className="bg-blue-700 rounded-lg p-4 max-w-2xl mx-auto text-left">
            <p className="text-sm mb-2">💡 验证提示：打开 DevTools Console</p>
            <ul className="text-sm space-y-1">
              <li>✅ 视口内的链接会被 Quicklink 自动预加载</li>
              <li>✅ 视口外的链接不会预加载（节省带宽）</li>
              <li>✅ 滚动到视口时才会触发预加载</li>
              <li>✅ Console 会显示 [Quicklink] 预加载日志</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 功能卡片网格 */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">快速导航</h2>

        {/* 视口内的链接 - 应该被立即预加载 */}
        <div className="mb-12">
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold mb-2">🟢 视口内区域（应该立即预加载）</p>
            <p className="text-sm text-green-700">
              这些链接在页面加载时就在视口内，Quicklink 会使用 requestIdleCallback
              在浏览器空闲时预加载它们
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/wallets"
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">钱包管理</h3>
              <p className="text-gray-600">查看和管理你的所有钱包</p>
              <p className="text-xs text-blue-600 mt-4">📊 静态预测概率: 80%</p>
            </Link>

            <Link
              to="/settings"
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">系统设置</h3>
              <p className="text-gray-600">配置应用偏好设置</p>
              <p className="text-xs text-blue-600 mt-4">📊 静态预测概率: 20%</p>
            </Link>
          </div>
        </div>

        {/* 间隔内容 - 用于创建滚动距离 */}
        <div className="my-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-12">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ⬇️ 向下滚动查看更多链接 ⬇️
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-2">🚀</div>
              <p className="font-semibold">Code Splitting</p>
              <p className="text-sm text-gray-600 mt-2">6 个独立 chunks</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-2">⚡</div>
              <p className="font-semibold">Brotli 压缩</p>
              <p className="text-sm text-gray-600 mt-2">72% 压缩率</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-2">🔮</div>
              <p className="font-semibold">Quicklink 预加载</p>
              <p className="text-sm text-gray-600 mt-2">智能预测</p>
            </div>
          </div>
        </div>

        {/* 更多间隔内容 */}
        <div className="my-16 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-8 shadow">
              <h4 className="text-xl font-bold mb-4">性能优化特性 #{i}</h4>
              <p className="text-gray-600 leading-relaxed">
                本项目展示了完整的前端工程化最佳实践，包括 Webpack 配置优化、 Code Splitting
                策略、Brotli 压缩、Service Worker、PWA 离线能力、 以及基于 Quicklink 和 Guess.js
                的智能预测加载。
              </p>
            </div>
          ))}
        </div>

        {/* 视口外的链接 - 需要滚动才能看到，才会被预加载 */}
        <div className="mb-12">
          <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-4 mb-6">
            <p className="text-orange-800 font-semibold mb-2">
              🟠 视口外区域（滚动到此处时才预加载）
            </p>
            <p className="text-sm text-orange-700">
              这些链接初始在视口外，只有当你滚动到这里时，IntersectionObserver
              才会检测到它们进入视口， 然后 Quicklink 才会开始预加载。打开 Console 查看预加载日志！
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/transactions"
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-purple-500"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">交易历史</h3>
              <p className="text-gray-600">查看所有交易记录</p>
              <p className="text-xs text-purple-600 mt-4">🔍 滚动到视口时预加载</p>
            </Link>

            <Link
              to="/analytics"
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-purple-500"
            >
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">数据分析</h3>
              <p className="text-gray-600">分析你的资产趋势</p>
              <p className="text-xs text-purple-600 mt-4">🔍 滚动到视口时预加载</p>
            </Link>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            🧪 如何验证 IntersectionObserver？
          </h3>
          <ol className="space-y-3 text-blue-800">
            <li>
              <strong>1. 打开 DevTools Console</strong> - 查看 [Quicklink] 日志
            </li>
            <li>
              <strong>2. 观察页面加载时</strong> - 绿色区域的链接（/wallets,
              /settings）会被立即预加载
            </li>
            <li>
              <strong>3. 滚动到橙色区域</strong> - 当链接进入视口时，才会看到预加载日志
            </li>
            <li>
              <strong>4. 打开 Network 面板</strong> - 筛选 "Prefetch" 类型，查看预加载的请求
            </li>
          </ol>
        </div>
      </div>

      {/* 底部 Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">Built with Webpack + React + Quicklink + Guess.js</p>
          <p className="text-sm text-gray-500 mt-2">完整前端工程化实践项目</p>
        </div>
      </footer>
    </div>
  );
}
