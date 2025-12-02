/**
 * 收藏按钮组件
 * 用于触发分析并收藏到 Cubox 的流程
 */

import { cn } from '@extension/ui';

interface SaveButtonProps {
  /** 是否禁用按钮 */
  disabled?: boolean;
  /** 点击事件处理函数 */
  onClick: () => void;
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 收藏按钮组件
 */
export const SaveButton = ({ disabled, onClick, className }: SaveButtonProps) => {
  return (
    <button
      className={cn(
        'mt-4 rounded-lg px-6 py-3 font-bold shadow transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
        'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        className,
      )}
      onClick={onClick}
      disabled={disabled}>
      {disabled ? '处理中...' : '分析并收藏到 Cubox'}
    </button>
  );
};


