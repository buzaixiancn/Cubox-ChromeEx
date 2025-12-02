/**
 * Options 设置页面
 * 用于配置 API Keys 和模型设置
 */

import '@src/Options.css';
import { useState, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { configStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Options = () => {
  const [config, setConfig] = useState({
    openaiApiKey: '',
    openaiApiEndpoint: 'https://api.chatanywhere.tech',
    openaiModel: 'gpt-3.5-turbo',
    tavilyApiKey: '',
    cuboxApiUrl: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 加载配置
    configStorage.get().then(setConfig);
  }, []);

  const handleSave = async () => {
    await configStorage.set(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn('min-h-screen p-8', 'bg-slate-50 dark:bg-gray-800')}>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Cubox 智能收藏 - 设置
        </h1>

        <div className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-700">
          {/* OpenAI 配置 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              OpenAI 配置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={config.openaiApiKey}
                  onChange={e => handleChange('openaiApiKey', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  API 端点
                </label>
                <input
                  type="text"
                  value={config.openaiApiEndpoint}
                  onChange={e => handleChange('openaiApiEndpoint', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="https://api.chatanywhere.tech"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  模型名称
                </label>
                <select
                  value={config.openaiModel}
                  onChange={e => handleChange('openaiModel', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  <option value="gpt-4">gpt-4</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                </select>
              </div>
            </div>
          </section>

          {/* Tavily 配置 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tavily 配置
            </h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tavily API Key
              </label>
              <input
                type="password"
                value={config.tavilyApiKey}
                onChange={e => handleChange('tavilyApiKey', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="tvly-..."
              />
            </div>
          </section>

          {/* Cubox 配置 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Cubox 配置
            </h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cubox API URL
              </label>
              <input
                type="text"
                value={config.cuboxApiUrl}
                onChange={e => handleChange('cuboxApiUrl', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="https://cubox.pro/c/api/save/..."
              />
            </div>
          </section>

          {/* 保存按钮 */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
              保存设置
      </button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">✅ 已保存</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
