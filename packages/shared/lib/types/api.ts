/**
 * API 相关的 TypeScript 类型定义
 */

/**
 * OpenAI API 分析结果
 */
export interface OpenAIAnalysisResult {
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 标签数组 */
  tags: string[];
}

/**
 * OpenAI API 请求参数
 */
export interface OpenAIRequestParams {
  /** 要分析的网址 */
  url: string;
  /** 网页内容（可选，如果提供则使用内容而不是 URL） */
  content?: string;
  /** API Key（可选，如果提供则使用此 Key） */
  apiKey?: string;
  /** API 端点（可选，如果提供则使用此端点） */
  apiEndpoint?: string;
  /** 模型名称（可选，如果提供则使用此模型） */
  model?: string;
}

/**
 * Cubox API 收藏请求参数
 */
export interface CuboxSaveParams {
  /** 要收藏的网址 */
  url: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description: string;
  /** 标签数组 */
  tags: string[];
  /** 收藏夹位置（可选） */
  folder?: string;
  /** 图片/快照 URL（可选，用于显示卡片缩略图） */
  image?: string;
}

/**
 * Cubox API 响应
 */
export interface CuboxSaveResponse {
  /** 状态码 */
  code: number;
  /** 消息 */
  message: string;
  /** 数据 */
  data: unknown;
}

/**
 * API 错误响应
 */
export interface APIError {
  /** 错误消息 */
  message: string;
  /** 错误代码（可选） */
  code?: number;
}

