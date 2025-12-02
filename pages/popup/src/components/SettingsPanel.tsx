/**
 * 设置面板组件
 * 集成在 Popup 内的设置界面
 */

import { cn } from '@extension/ui';

export interface ConfigType {
  openaiApiKey: string;
  openaiApiEndpoint: string;
  openaiModel: string;
  tavilyApiKey: string;
  cuboxApiUrl: string;
  keyboardShortcut: string;
  autoAnalyze: boolean;
  enableTavily: boolean;
}

interface SettingsPanelProps {
  config: ConfigType;
  onConfigChange: (key: keyof ConfigType, value: string | boolean) => void;
  onSave: () => void;
  onClose: () => void;
  saved: boolean;
}

export const SettingsPanel = ({
  config,
  onConfigChange,
  onSave,
  onClose,
  saved,
}: SettingsPanelProps) => {
  return (
    <div className="w-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">设置</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
          {/* OpenAI 配置 */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              OpenAI 配置
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={config.openaiApiKey}
                  onChange={e => onConfigChange('openaiApiKey', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  API 端点
                </label>
                <input
                  type="text"
                  value={config.openaiApiEndpoint}
                  onChange={e => onConfigChange('openaiApiEndpoint', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
                  placeholder="https://api.chatanywhere.tech"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  模型名称
                </label>
                <select
                  value={config.openaiModel}
                  onChange={e => onConfigChange('openaiModel', e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400">
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  <option value="gpt-4">gpt-4</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                </select>
              </div>
            </div>
          </section>

          {/* Tavily 配置 */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Tavily 配置
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    启用 Tavily API
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    启用后将使用 Tavily API 提取网页内容，关闭则使用本地方式
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onConfigChange('enableTavily', !config.enableTavily)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    config.enableTavily
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700',
                  )}>
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      config.enableTavily ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
              {config.enableTavily && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Tavily API Key
                  </label>
                  <input
                    type="password"
                    value={config.tavilyApiKey}
                    onChange={e => onConfigChange('tavilyApiKey', e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
                    placeholder="tvly-..."
                  />
                </div>
              )}
            </div>
          </section>

          {/* Cubox 配置 */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Cubox 配置
            </h3>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Cubox API URL
              </label>
              <input
                type="text"
                value={config.cuboxApiUrl}
                onChange={e => onConfigChange('cuboxApiUrl', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
                placeholder="https://cubox.pro/c/api/save/..."
              />
            </div>
          </section>

          {/* 快捷键配置 */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              快捷键配置
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  打开扩展快捷键
                </label>
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {config.keyboardShortcut || 'Ctrl+Shift+S'}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  默认快捷键：Ctrl+Shift+S（Mac: Cmd+Shift+S）
                </p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  💡 提示：可在 Chrome 扩展管理页面自定义快捷键
                </p>
              </div>
            </div>
          </section>

          {/* 功能开关 */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              功能开关
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    启用 Tavily API
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    启用后将使用 Tavily API 提取网页内容，关闭则使用本地方式
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onConfigChange('enableTavily', !config.enableTavily)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    config.enableTavily
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700',
                  )}>
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      config.enableTavily ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    快速分析
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    打开扩展时自动开始分析当前页面
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onConfigChange('autoAnalyze', !config.autoAnalyze)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    config.autoAnalyze
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700',
                  )}>
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      config.autoAnalyze ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onSave}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
            保存设置
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">✅ 已保存</span>
          )}
        </div>
      </div>
    </div>
  );
};

