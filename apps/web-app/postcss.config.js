// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 PostCSS 配置 - Tailwind CSS 4.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Tailwind CSS 4.0 变化：
 *
 * - 旧版本（3.x）：plugins: { tailwindcss: {} }
 * - 新版本（4.0）：plugins: { '@tailwindcss/postcss': {} }
 *
 * Tailwind 4.0 已将 PostCSS 插件独立为 @tailwindcss/postcss 包
 */

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
