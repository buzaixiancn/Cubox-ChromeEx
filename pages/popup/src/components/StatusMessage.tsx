/**
 * 状态消息组件
 * 用于显示成功、错误或加载状态
 */

import { cn } from '@extension/ui';

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface StatusMessageProps {
  /** 状态类型 */
  status: StatusType;
  /** 消息内容 */
  message?: string;
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 状态消息组件
 */
export const StatusMessage = ({ status, message, className }: StatusMessageProps) => {
  if (status === 'idle' || !message) {
    return null;
  }

  const statusConfig = {
    loading: {
      icon: '⏳',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-800 dark:text-blue-200',
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-800 dark:text-green-200',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-800 dark:text-red-200',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'mt-4 rounded-lg px-4 py-3 text-sm',
        config.bgColor,
        config.textColor,
        className,
      )}>
      <div className="flex items-center gap-2">
        <span>{config.icon}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};


