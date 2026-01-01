// ⚛️ 导入 React
import React from 'react';

// 🎨 导入样式文件
import './button.css';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 TypeScript 接口定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ButtonProps 定义了 Button 组件接受的所有属性
// 这些注释会被 Storybook 用于自动生成文档
export interface ButtonProps {
  /** 是否为主要操作按钮？主按钮通常用于页面的核心操作 */
  primary?: boolean;

  /** 自定义背景颜色（可选） */
  backgroundColor?: string;

  /** 按钮尺寸：small（小） | medium（中） | large（大） */
  size?: 'small' | 'medium' | 'large';

  /** 按钮显示的文本内容 */
  label: string;

  /** 点击事件处理函数（可选） */
  onClick?: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 Button 组件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/** 用于用户交互的主要 UI 组件 */
export const Button = ({
  primary = false,          // 默认为次要按钮
  size = 'medium',          // 默认中等尺寸
  backgroundColor,          // 自定义背景色（可选）
  label,                    // 按钮文本
  ...props                  // 其他原生 button 属性（如 onClick 等）
}: ButtonProps) => {
  // 🎨 根据 primary 属性决定样式类名
  const mode = primary
    ? 'storybook-button--primary'    // 主按钮样式
    : 'storybook-button--secondary'; // 次要按钮样式

  return (
    <button
      type="button"
      // 📦 组合多个 CSS 类名：
      // 1. 基础类名：storybook-button
      // 2. 尺寸类名：storybook-button--small/medium/large
      // 3. 模式类名：storybook-button--primary/secondary
      className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}

      // 🎨 如果提供了自定义背景色，则应用内联样式
      style={{ backgroundColor }}

      // ⚡ 展开其他属性（包括 onClick 等事件处理器）
      {...props}
    >
      {label}
    </button>
  );
};

// 💡 组件使用示例：
// <Button label="点击我" primary={true} size="large" onClick={() => alert('Hello!')} />
