/**
 * 配置存储
 * 用于存储 API Keys 和模型配置
 */

import { createStorage, StorageEnum } from '../base/index.js';

export interface ConfigStateType {
  openaiApiKey: string;
  openaiApiEndpoint: string;
  openaiModel: string;
  tavilyApiKey: string;
  cuboxApiUrl: string;
  keyboardShortcut: string; // 快捷键，格式如 "Ctrl+Shift+S"
  autoAnalyze: boolean; // 是否在打开扩展时自动分析
  enableTavily: boolean; // 是否启用 Tavily API（默认 true，保持向后兼容）
}

const defaultConfig: ConfigStateType = {
  openaiApiKey: '',
  openaiApiEndpoint: 'https://api.chatanywhere.tech',
  openaiModel: 'gpt-3.5-turbo',
  tavilyApiKey: '',
  cuboxApiUrl: '',
  keyboardShortcut: 'Ctrl+Shift+S', // 默认快捷键
  autoAnalyze: false, // 默认不自动分析
  enableTavily: true, // 默认启用 Tavily API，保持向后兼容
};

const storage = createStorage<ConfigStateType>(
  'cubox-config-storage-key',
  defaultConfig,
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const configStorage = storage;


