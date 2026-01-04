// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ Webpack 公共配置
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 读取环境变量
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || '';

module.exports = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 入口文件
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  entry: {
    main: './src/index.tsx',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📦 输出配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  output: {
    path: path.resolve(__dirname, '../dist'),

    /**
     * 文件名配置（contenthash 实现长期缓存）
     *
     * [name]: entry 的 key（如 main）
     * [contenthash:8]: 内容哈希的前 8 位
     *
     * 为什么使用 contenthash？
     * - 文件内容不变，hash 不变
     * - 浏览器可以长期缓存（配合 Nginx Cache-Control）
     * - 内容变化时，hash 变化，自动失效缓存
     */
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]',

    // 构建前清理 dist 目录
    clean: true,

    // 公共路径（CDN 部署时可改为 CDN 地址）
    publicPath: '/',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔍 模块解析
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  resolve: {
    // 自动解析的扩展名
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],

    /**
     * 路径别名（与 tsconfig.json 保持一致）
     *
     * 为什么需要别名？
     * 1. @/* 简化应用内部导入
     * 2. @qincai/* 指向 monorepo packages 源码
     * 3. 开发时实现 HMR（热模块替换）
     * 4. 通过 SourceMap 可以定位到源码
     */
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@qincai/libs': path.resolve(__dirname, '../../../packages/qc-libs/src'),
      '@qincai/hooks': path.resolve(__dirname, '../../../packages/qc-hooks/src'),
      '@qincai/ui': path.resolve(__dirname, '../../../packages/qc-ui/src'),
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 Loader 配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  module: {
    rules: [
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 1️⃣ TypeScript/JavaScript 处理（使用 SWC）
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      /**
       * 为什么使用 swc-loader 而不是 babel-loader？
       *
       * 性能优势：
       * - SWC 用 Rust 编写，比 Babel 快 20-70 倍
       * - 缩短开发时的重新编译时间
       * - 缩短生产构建时间
       *
       * 功能完整：
       * - 支持 TypeScript（无需 ts-loader）
       * - 支持 JSX
       * - 支持自动 Polyfills
       * - 支持 React Fast Refresh
       *
       * 现代化：
       * - Next.js 13+、Turbopack 都在使用
       * - 是下一代构建工具的趋势
       */
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            // SWC 配置继承自 .swcrc
            // 开发/生产环境的差异在各自的 webpack 配置中覆盖
          },
        },
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 2️⃣ CSS 处理（Tailwind CSS 4.0）
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      /**
       * CSS 处理流程（从右到左）：
       *
       * 1. postcss-loader：
       *    - 处理 Tailwind CSS (@import "tailwindcss")
       *    - 添加浏览器前缀（autoprefixer）
       *
       * 2. css-loader：
       *    - 解析 @import 和 url()
       *    - 启用 CSS Modules（可选）
       *
       * 3. MiniCssExtractPlugin.loader：
       *    - 将 CSS 提取到单独的文件
       *    - 生产环境使用（开发环境使用 style-loader）
       */
      {
        test: /\.css$/,
        use: [
          // 开发环境使用 style-loader（HMR），生产环境使用 MiniCssExtractPlugin
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1, // 在 css-loader 前应用 1 个 loader（postcss-loader）
              modules: {
                // 自动识别 CSS Modules（.module.css 文件）
                auto: /\.module\.css$/,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'postcss-loader', // 处理 Tailwind CSS 和 autoprefixer
        ],
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 3️⃣ 图片处理（Webpack 5 内置 Asset Modules）
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      /**
       * Asset Modules 类型：
       *
       * - asset/resource: 生成独立文件并导出 URL
       * - asset/inline: 导出资源的 data URI
       * - asset: 自动选择（< maxSize 时 inline，否则 resource）
       *
       * 为什么小图片转 base64？
       * - 减少 HTTP 请求数
       * - 适合小图标、Logo
       * - 但会增大 bundle 体积（谨慎使用）
       */
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 小于 8KB 的图片转为 base64
          },
        },
      },

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 4️⃣ 字体文件
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔌 插件配置
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  plugins: [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1️⃣ 生成 HTML 文件
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * HtmlWebpackPlugin 功能：
     * - 自动注入 <script> 标签（引用打包后的 JS）
     * - 自动注入 <link> 标签（引用打包后的 CSS）
     * - 压缩 HTML（生产环境）
     *
     * 环境分离策略：
     * - 开发环境：index-dev.html（无 GA 追踪）
     * - 生产环境：index-prod.html（有 GA 追踪）
     */
    new HtmlWebpackPlugin({
      // 根据环境选择不同的 HTML 模板
      template: process.env.NODE_ENV === 'production'
        ? './public/index-prod.html'
        : './public/index-dev.html',

      inject: 'body', // 将脚本注入到 <body> 底部
      scriptLoading: 'defer', // 使用 defer 加载脚本（不阻塞 HTML 解析）

      /**
       * 模板参数注入
       *
       * gaId: Google Analytics Measurement ID
       * - 从环境变量 GA_MEASUREMENT_ID 读取
       * - 未设置则为空字符串（index-prod.html 会显示警告）
       * - 在 HTML 中通过 <%= htmlWebpackPlugin.options.gaId %> 使用
       *
       * 启用方式：
       * 1. 获取 GA Measurement ID（格式：G-XXXXXXXXXX）
       * 2. 设置环境变量：GA_MEASUREMENT_ID=G-XXXXXXXXXX
       * 3. 重新构建：pnpm run build
       */
      templateParameters: (compilation, assets, assetTags, options) => {
        // 将 gaId 添加到 options 中，这样模板中可以通过 htmlWebpackPlugin.options.gaId 访问
        return {
          compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options: {
              ...options,
              gaId: GA_MEASUREMENT_ID,
            },
          },
        };
      },

      minify: process.env.NODE_ENV === 'production'
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          }
        : false
    }),

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2️⃣ 提取 CSS 到单独文件（生产环境）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 为什么提取 CSS？
     * - 并行加载 CSS 和 JS（更快）
     * - 利用浏览器缓存
     * - 避免 FOUC（Flash of Unstyled Content）
     */
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
  ],
};
