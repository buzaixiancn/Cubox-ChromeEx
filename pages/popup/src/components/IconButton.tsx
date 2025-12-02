/**
 * 图标按钮组件
 */

import { cn } from '@extension/ui';

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const IconButton = ({ onClick, children, className, title }: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-1.5',
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        'dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700',
        'transition-colors duration-200',
        className,
      )}>
      {children}
    </button>
  );
};


