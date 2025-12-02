/**
 * Popup 主组件
 * 实现分析网址并收藏到 Cubox 的完整流程
 * 采用现代化设计，参考最佳实践
 */

import '@src/Popup.css';
import { useState, useEffect } from 'react';
import {
  analyzeUrlWithOpenAI,
  saveToCubox,
  extractUrlContent,
  extractUrlContentLocal,
  withErrorBoundary,
  withSuspense,
} from '@extension/shared';
import { configStorage } from '@extension/storage';
import { cn, LoadingSpinner, ErrorDisplay } from '@extension/ui';
import { UrlCard } from '@src/components/UrlCard';
import { IconButton } from '@src/components/IconButton';
import type { StatusType } from '@src/components/StatusMessage';
import { SettingsPanel, type ConfigType } from '@src/components/SettingsPanel';
import { PreviewPanel, type AnalysisResult } from '@src/components/PreviewPanel';

const Popup = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [status, setStatus] = useState<StatusType>('idle');
  const [message, setMessage] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]); // 保存提取的图片
  const [config, setConfig] = useState<ConfigType>({
    openaiApiKey: '',
    openaiApiEndpoint: 'https://api.chatanywhere.tech',
    openaiModel: 'gpt-3.5-turbo',
    tavilyApiKey: '',
    cuboxApiUrl: '',
    keyboardShortcut: 'Ctrl+Shift+S',
    autoAnalyze: false,
    enableTavily: true, // 默认启用 Tavily，保持向后兼容
  });

  /**
   * 动态调整 popup 高度以适应内容
   * 在视图切换时（设置面板 ↔ 主界面）重新调整高度
   */
  useEffect(() => {
    const adjustHeight = () => {
      requestAnimationFrame(() => {
        try {
          const container = document.getElementById('app-container');
          if (!container) return;

          // 重置高度，让内容自然展开
          document.body.style.height = 'auto';
          document.documentElement.style.height = 'auto';

          // 强制重排，获取真实高度
          const scrollHeight = container.scrollHeight;
          const bodyScrollHeight = document.body.scrollHeight;
          const htmlScrollHeight = document.documentElement.scrollHeight;

          // 取最大值作为实际内容高度
          const contentHeight = Math.max(scrollHeight, bodyScrollHeight, htmlScrollHeight, 200);

          // 设置高度
          if (contentHeight > 0) {
            document.body.style.height = `${contentHeight}px`;
            document.documentElement.style.height = `${contentHeight}px`;
          }
        } catch (error) {
          console.error('调整高度失败:', error);
        }
      });
    };

    // 立即调整
    adjustHeight();

    // 延迟调整，确保 DOM 已完全渲染
    const timeouts = [50, 100, 200, 400].map(delay => setTimeout(adjustHeight, delay));

    // 使用 ResizeObserver 监听内容变化
    let resizeObserver: ResizeObserver | null = null;
    try {
      const container = document.getElementById('app-container');
      if (container) {
        resizeObserver = new ResizeObserver(() => {
          adjustHeight();
        });
        resizeObserver.observe(container);
        resizeObserver.observe(document.body);
      }
    } catch (error) {
      console.warn('ResizeObserver 不可用:', error);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [showSettings, showPreview, analysisResult, message, status]);

  /**
   * 获取当前标签页的 URL 和配置
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        let targetUrl = '';
        
        // 方法1: 检查 URL 参数（新窗口方式打开时传递的）
        const urlParams = new URLSearchParams(window.location.search);
        const urlFromParam = urlParams.get('url');
        
        if (urlFromParam) {
          targetUrl = urlFromParam;
          console.log('从 URL 参数获取 URL:', targetUrl);
        } else {
          // 方法2: 检查 storage（快捷键直接打开 popup 时保存的）
          try {
            const storageData = await chrome.storage.local.get(['shortcut_target_url', 'shortcut_timestamp']);
            const storedUrl = storageData.shortcut_target_url;
            const timestamp = storageData.shortcut_timestamp;
            
            // 检查时间戳，如果超过 5 秒则忽略（避免使用过期的 URL）
            if (storedUrl && timestamp && (Date.now() - timestamp < 5000)) {
              targetUrl = storedUrl;
              console.log('从 storage 获取 URL (快捷键):', targetUrl);
              // 清除 storage，避免下次误用
              await chrome.storage.local.remove(['shortcut_target_url', 'shortcut_timestamp']);
            }
          } catch (storageError) {
            console.log('读取 storage 失败:', storageError);
          }
          
          // 方法3: 如果前两种方法都没有，尝试获取当前标签页的 URL（正常点击扩展图标的情况）
          if (!targetUrl) {
            try {
              const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
              if (tab.url && !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('chrome://')) {
                // 排除扩展自身的 URL
                targetUrl = tab.url;
                console.log('从当前标签页获取 URL:', targetUrl);
              } else {
                // 如果当前标签页是扩展页面，尝试获取最后一个非扩展标签页
                const allTabs = await chrome.tabs.query({});
                const nonExtensionTab = allTabs
                  .filter(t => t.url && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('chrome://'))
                  .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
                
                if (nonExtensionTab?.url) {
                  targetUrl = nonExtensionTab.url;
                  console.log('从其他标签页获取 URL:', targetUrl);
                } else {
                  targetUrl = '无法获取当前页面 URL';
                }
              }
            } catch (tabError) {
              console.error('获取标签页失败:', tabError);
              targetUrl = '无法获取当前页面 URL';
            }
          }
        }
        
        setCurrentUrl(targetUrl);

        // 加载配置
        const savedConfig = await configStorage.get();
        setConfig(savedConfig);
      } catch (error) {
        console.error('获取数据失败:', error);
        setCurrentUrl('无法获取当前页面 URL');
      }
    };

    fetchData();
  }, []);

  /**
   * 自动分析功能
   */
  useEffect(() => {
    const autoAnalyzeIfEnabled = async () => {
      // 只有在配置加载完成、有 URL、且启用了自动分析时才执行
      if (
        config.autoAnalyze &&
        currentUrl &&
        !currentUrl.startsWith('chrome:') &&
        !currentUrl.startsWith('about:') &&
        !currentUrl.includes('无法获取') &&
        config.tavilyApiKey &&
        config.openaiApiKey &&
        !showSettings &&
        !showPreview &&
        status === 'idle'
      ) {
        // 延迟一下，确保 UI 已经渲染
        setTimeout(() => {
          handleAnalyze();
        }, 300);
      }
    };

    autoAnalyzeIfEnabled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.autoAnalyze, currentUrl, config.tavilyApiKey, config.openaiApiKey, showSettings, showPreview, status]);

  /**
   * 处理配置变更
   */
  const handleConfigChange = (key: keyof ConfigType, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  /**
   * 保存配置
   */
  const handleSaveConfig = async () => {
    await configStorage.set(config);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowSettings(false);
    }, 1500);
  };

  /**
   * 处理分析流程（不直接保存）
   */
  const handleAnalyze = async () => {
    if (!currentUrl || currentUrl.startsWith('chrome:') || currentUrl.startsWith('about:')) {
      setStatus('error');
      setMessage('无法收藏此类型的页面（chrome:// 或 about:// 页面）');
      return;
    }

    // 检查 OpenAI 配置（两种方式都需要）
    if (!config.openaiApiKey) {
      setStatus('error');
      setMessage('请先配置 OpenAI API Key');
      setShowSettings(true);
      return;
    }

    // 根据开关选择提取方式
    const useTavily = config.enableTavily;

    // 如果使用 Tavily，检查 API Key
    if (useTavily && !config.tavilyApiKey) {
      setStatus('error');
      setMessage('请先配置 Tavily API Key');
      setShowSettings(true);
      return;
    }

    setStatus('loading');
    setMessage(
      useTavily
        ? '正在使用 Tavily 提取网页内容...'
        : '正在使用本地方式提取网页内容...',
    );

    try {
      let extractResult;

      // 步骤1: 根据开关选择提取方式
      if (useTavily) {
        // 使用 Tavily API 提取
        extractResult = await extractUrlContent(currentUrl, config.tavilyApiKey);
      } else {
        // 使用本地方式提取
        // 获取当前标签页 ID
        let tabId: number | undefined;
        try {
          const [activeTab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });
          if (activeTab?.id) {
            tabId = activeTab.id;
          }
        } catch (error) {
          console.warn('获取标签页 ID 失败，尝试使用 URL:', error);
        }

        extractResult = await extractUrlContentLocal(currentUrl, tabId);
      }

      const content = extractResult.rawContent || '';

      if (!content || content.trim().length === 0) {
        throw new Error(
          useTavily
            ? 'Tavily 未能提取到网页内容，请检查 URL 是否可访问'
            : '本地提取未能获取到网页内容，可能是页面结构特殊或需要登录访问',
        );
      }

      // 保存提取的图片（用于 Cubox 快照）
      const images = extractResult.images || [];
      setExtractedImages(images);

      setMessage('内容提取完成，正在使用 AI 分析...');

      // 步骤2: 使用 OpenAI 分析内容
      const analysis = await analyzeUrlWithOpenAI({
        url: currentUrl,
        content: `网页内容：\n${content.substring(0, 5000)}`, // 限制内容长度
        apiKey: config.openaiApiKey,
        apiEndpoint: config.openaiApiEndpoint,
        model: config.openaiModel,
      });

      // 保存分析结果并显示预览
      setAnalysisResult(analysis);
      setShowPreview(true);
      setStatus('idle');
      setMessage('');
    } catch (error) {
      // 错误处理
      setStatus('error');
      const errorMessage =
        error instanceof Error ? error.message : '未知错误，请稍后重试';
      setMessage(`分析失败: ${errorMessage}`);
      console.error('分析流程出错:', error);
    }
  };

  /**
   * 确认保存到 Cubox
   */
  const handleConfirmSave = async (analysis: AnalysisResult) => {
    if (!config.cuboxApiUrl) {
      setStatus('error');
      setMessage('请先配置 Cubox API URL');
      setShowSettings(true);
      setShowPreview(false);
      return;
    }

    setStatus('loading');
    setMessage('正在保存到 Cubox...');

    try {
      // 获取第一张图片作为快照（1:1 比例）
      const snapshotImage = extractedImages.length > 0 ? extractedImages[0] : undefined;
      
      await saveToCubox({
        url: currentUrl,
        title: analysis.title,
        description: analysis.description,
        tags: analysis.tags,
        apiUrl: config.cuboxApiUrl,
        image: snapshotImage, // 传递图片 URL
      });

      // 成功 - 关闭扩展窗口
      setStatus('success');
      setMessage(`收藏成功！标题: ${analysis.title}`);
      setShowPreview(false);
      setAnalysisResult(null);
      
      // 延迟关闭，让用户看到成功消息
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (error) {
      // 错误处理
      setStatus('error');
      const errorMessage =
        error instanceof Error ? error.message : '未知错误，请稍后重试';
      setMessage(`收藏失败: ${errorMessage}`);
      console.error('收藏流程出错:', error);
    }
  };

  /**
   * 取消预览
   */
  const handleCancelPreview = () => {
    setShowPreview(false);
    setAnalysisResult(null);
    setStatus('idle');
    setMessage('');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <svg
            className="h-4 w-4 animate-spin text-blue-500"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="h-4 w-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const isDisabled =
    status === 'loading' || !currentUrl || currentUrl.includes('无法获取');

  // 如果显示设置面板，只显示设置界面
  if (showSettings) {
    return (
      <div className={cn('w-[420px] flex flex-col rounded-xl overflow-hidden', 'bg-white dark:bg-gray-800')}>
        <SettingsPanel
          config={config}
          onConfigChange={handleConfigChange}
          onSave={handleSaveConfig}
          onClose={() => setShowSettings(false)}
          saved={saved}
        />
      </div>
    );
  }

  return (
    <div className={cn('w-[420px] flex flex-col rounded-xl overflow-hidden', 'bg-white dark:bg-gray-800')}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <svg
              className="h-5 w-5 text-blue-500"
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
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cubox 智能收藏
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* 预览模式下的操作按钮 */}
          {showPreview && analysisResult ? (
            <>
              <button
                onClick={handleCancelPreview}
                disabled={status === 'loading'}
                className={cn(
                  'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all shadow-sm',
                  'hover:bg-gray-50 hover:shadow-md',
                  'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-gray-300/50',
                )}>
                取消
              </button>
              <button
                onClick={() => handleConfirmSave(analysisResult)}
                disabled={status === 'loading' || !analysisResult.title.trim()}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-sm',
                  'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
                  'dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm',
                  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                )}>
                {status === 'loading' ? (
                  <>
                    <svg
                      className="mr-1 inline-block h-3 w-3 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中
                  </>
                ) : (
                  '确认保存到 Cubox'
                )}
              </button>
            </>
          ) : (
            <IconButton onClick={() => setShowSettings(true)} title="设置">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </IconButton>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
          {/* URL Card */}
          <UrlCard url={currentUrl} />

          {/* 预览面板 */}
          {showPreview && analysisResult ? (
            <PreviewPanel
              analysis={analysisResult}
              onConfirm={handleConfirmSave}
              onCancel={handleCancelPreview}
              isSaving={status === 'loading'}
            />
          ) : (
            <>
              {/* Main Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={isDisabled}
                className={cn(
                  'w-full h-12 rounded-lg font-medium text-base',
                  'flex items-center justify-center gap-2',
                  'bg-blue-500 text-white hover:bg-blue-600',
                  'dark:bg-blue-600 dark:hover:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                  'shadow-sm hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'dark:focus:ring-offset-gray-800',
                )}>
                {status === 'loading' ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    分析网页内容
                  </>
                )}
              </button>

              {/* Status Message */}
              {message && (
                <div
                  className={cn(
                    'rounded-lg border p-4',
                    'animate-in slide-in-from-bottom-2 duration-200',
                    status === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : status === 'error'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
                  )}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{getStatusIcon()}</div>
                    <div className="flex-1 space-y-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          status === 'success'
                            ? 'text-green-800 dark:text-green-200'
                            : status === 'error'
                            ? 'text-red-800 dark:text-red-200'
                            : 'text-blue-800 dark:text-blue-200',
                        )}>
                        {status === 'success'
                          ? '成功'
                          : status === 'error'
                          ? '错误'
                          : '处理中'}
                      </p>
                      <p
                        className={cn(
                          'text-xs',
                          status === 'success'
                            ? 'text-green-700 dark:text-green-300'
                            : status === 'error'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-blue-700 dark:text-blue-300',
                        )}>
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
