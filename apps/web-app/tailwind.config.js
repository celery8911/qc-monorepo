/** @type {import('tailwindcss').Config} */
module.exports = {
  // 扫描文件以提取类名
  content: [
    './src/**/*.{ts,tsx}',
    './public/index.html',
    // 包含 monorepo 中 UI 组件库的源码
    '../../packages/qc-ui/src/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      // 自定义主题扩展
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },

  plugins: [],
};
