/**
 * 预览和编辑面板组件
 * 显示 AI 分析结果并允许用户编辑
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@extension/ui';

export interface AnalysisResult {
  title: string;
  description: string;
  tags: string[];
}

interface PreviewPanelProps {
  analysis: AnalysisResult;
  onConfirm: (analysis: AnalysisResult) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const PreviewPanel = ({
  analysis: initialAnalysis,
  onConfirm,
  onCancel,
  isSaving = false,
}: PreviewPanelProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResult>(initialAnalysis);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 自适应 textarea 高度
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // 当外部传入的 analysis 变化时更新
  useEffect(() => {
    setAnalysis(initialAnalysis);
    // 延迟更新 textarea 高度，确保 DOM 已渲染
    setTimeout(() => {
      if (textareaRef.current) {
        adjustTextareaHeight(textareaRef.current);
      }
    }, 0);
  }, [initialAnalysis]);
  
  // 组件挂载时调整高度
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, []);

  const handleTitleChange = (value: string) => {
    setAnalysis(prev => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setAnalysis(prev => ({ ...prev, description: value }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !analysis.tags.includes(trimmed)) {
      setAnalysis(prev => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAnalysis(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <svg className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              AI 分析完成
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              请检查并编辑后确认保存
            </p>
          </div>
        </div>
      </div>

      {/* 标题编辑 */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          标题 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={analysis.title}
          onChange={e => handleTitleChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400"
          placeholder="输入标题"
        />
      </div>

      {/* 描述编辑 */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          描述
        </label>
        <textarea
          ref={textareaRef}
          value={analysis.description}
          onChange={e => {
            handleDescriptionChange(e.target.value);
            // 自适应高度
            adjustTextareaHeight(e.target);
          }}
          onInput={(e) => {
            // 确保输入时也自适应
            adjustTextareaHeight(e.target as HTMLTextAreaElement);
          }}
          style={{ minHeight: '80px', overflow: 'hidden', resize: 'none' }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400"
          placeholder="输入描述"
        />
      </div>

      {/* 标签编辑 */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          标签 <span className="text-gray-500 font-normal">({analysis.tags.length} 个)</span>
        </label>
        <div className="mb-2 flex flex-wrap gap-2 p-1 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          {analysis.tags.length > 0 ? (
            analysis.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 transition-colors">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">暂无标签</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-400"
            placeholder="输入标签后按 Enter 添加"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            添加
          </button>
        </div>
      </div>
    </div>
  );
};

