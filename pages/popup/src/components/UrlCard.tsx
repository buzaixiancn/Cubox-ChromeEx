/**
 * URL 卡片组件
 */

import { cn } from '@extension/ui';

interface UrlCardProps {
  url: string;
  className?: string;
}

export const UrlCard = ({ url, className }: UrlCardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        'bg-gray-50 dark:bg-gray-700/50',
        'border-gray-200 dark:border-gray-600',
        className,
      )}>
      <div className="flex items-center gap-2">
        {/* 图标在左边 */}
        <svg
          className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        {/* 当前页面标签 */}
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex-shrink-0">
          当前页面
        </span>
        {/* URL 在右边，单行显示，可以水平滚动查看完整内容 */}
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide overflow-y-hidden">
          <p
            className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
            title={url}>
            {url}
          </p>
        </div>
      </div>
    </div>
  );
};

