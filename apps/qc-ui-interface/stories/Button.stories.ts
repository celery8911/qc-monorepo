// 📚 Storybook 类型导入
// Meta: 定义组件元数据的类型（标题、参数、装饰器等）
// StoryObj: 定义单个 Story 的类型（每个展示案例）
import type { Meta, StoryObj } from '@storybook/react-vite';

// 📝 测试工具：用于监听和记录组件的交互行为（如点击事件）
import { fn } from '@storybook/test';

// 🧩 导入我们要展示的 Button 组件
import { Button } from './Button';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 元数据配置 (Meta)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 这是 Story 文件的核心配置，定义了这个组件在 Storybook 中的行为
const meta = {
  // 📁 在 Storybook 侧边栏中的位置和名称
  // Example/Button 表示：Example 文件夹下的 Button 组件
  title: 'Example/Button',

  // 🎯 要展示的 React 组件
  component: Button,

  // ⚙️ 参数配置
  parameters: {
    // 布局模式：'centered' 表示组件在画布中居中显示
    // 其他选项：'fullscreen'（全屏）、'padded'（带边距）
    layout: 'centered',
  },

  // 🏷️ 标签：'autodocs' 会自动生成文档页面
  // 基于组件的 Props 和注释自动生成 API 文档
  tags: ['autodocs'],

  // 🎨 ArgTypes：控制面板中的参数类型定义
  // 可以为每个 prop 指定控件类型（颜色选择器、下拉框、文本输入等）
  argTypes: {
    backgroundColor: { control: 'color' }, // 颜色选择器
  },

  // 📌 默认参数：所有 Story 共享的默认值
  // fn() 是一个监听函数，会在 Actions 面板中显示点击事件
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

// 🔒 导出元数据（必须）
// Storybook 通过 default export 识别这个文件是一个 Story 文件
export default meta;

// 📝 定义 Story 类型（基于 meta 的类型推导）
type Story = StoryObj<typeof meta>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📚 Story 定义（每个 Story 是组件的一个展示案例）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Story 命名规则：使用 PascalCase（大驼峰命名）
// 每个导出的对象都会在 Storybook 中显示为一个独立的案例

// 🔵 Primary Story - 主要按钮样式
// 展示最常用的主要操作按钮（如提交、确认等）
export const Primary: Story = {
  args: {
    primary: true,      // 使用主色调样式
    label: 'Button',    // 按钮文本
  },
};

// ⚪ Secondary Story - 次要按钮样式
// 展示次要操作按钮（如取消、返回等）
export const Secondary: Story = {
  args: {
    label: 'Button',    // primary 默认为 false，显示次要样式
  },
};

// 📏 Large Story - 大尺寸按钮
// 展示大尺寸按钮的样式
export const Large: Story = {
  args: {
    size: 'large',      // 尺寸：large（大）
    label: 'Button',
  },
};

// 📐 Small Story - 小尺寸按钮
// 展示小尺寸按钮的样式
export const Small: Story = {
  args: {
    size: 'small',      // 尺寸：small（小）
    label: 'Button',
  },
};

// 💡 如何添加新的 Story：
// export const YourStoryName: Story = {
//   args: {
//     // 在这里设置组件的 props
//   },
// };

