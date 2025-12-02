/**
 * Tavily API 服务模块
 * 用于提取网页内容
 */

/**
 * Tavily Extract API 响应结果
 * 注意：API 实际返回的是 raw_content（下划线），不是 rawContent（驼峰）
 */
export interface TavilyExtractResult {
  url: string;
  rawContent: string; // 标准化后的字段名
  raw_content?: string; // API 实际返回的字段名
  favicon?: string;
  images?: string[];
  title?: string;
}

/**
 * Tavily Extract API 响应
 */
export interface TavilyExtractResponse {
  results: Array<{
    url: string;
    raw_content: string; // API 实际返回的字段名
    favicon?: string;
    images?: string[];
    title?: string;
  }>;
  failed_results?: Array<{ url: string; error: string }>;
  failedResults?: Array<{ url: string; error: string }>;
  response_time?: number;
  responseTime?: number;
  request_id?: string;
  requestId?: string;
}

/**
 * 提取网页内容
 * @param url - 要提取内容的网址
 * @returns Promise<TavilyExtractResult> 提取结果
 */
export async function extractUrlContent(url: string, apiKey?: string): Promise<TavilyExtractResult> {
  // 优先使用传入的参数，否则使用环境变量
  // @ts-ignore
  const key = apiKey || import.meta.env?.VITE_TAVILY_API_KEY;

  if (!key) {
    throw new Error('Tavily API Key 未配置');
  }

  const apiUrl = 'https://api.tavily.com/extract';

  const requestBody = {
    api_key: key,
    urls: [url],
    extract_depth: 'advanced',
    format: 'markdown',
    include_images: true, // 启用图片提取，用于 Cubox 快照
    include_favicon: true,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMessage = `Tavily API 请求失败: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      console.error('Tavily API 错误详情:', errorData);
    } catch {
      const errorText = await response.text().catch(() => '');
      console.error('Tavily API 错误响应:', errorText);
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as TavilyExtractResponse;

  // 检查是否有失败的提取（支持两种字段名格式）
  const failedResults = data.failed_results || data.failedResults || [];
  if (failedResults.length > 0) {
    const failed = failedResults[0];
    const errorMsg = failed.error || '未知错误';
    console.error('Tavily 提取失败详情:', failed);
    throw new Error(`Tavily 提取失败: ${errorMsg}`);
  }

  // 检查是否有结果
  if (!data.results || data.results.length === 0) {
    console.error('Tavily 响应数据:', data);
    throw new Error('Tavily 未返回任何内容，请检查 URL 是否可访问');
  }

  const apiResult = data.results[0];
  
  // API 返回的是 raw_content（下划线），需要转换为 rawContent（驼峰）
  const rawContent = apiResult.raw_content || '';
  
  // 检查内容是否为空
  if (!rawContent || rawContent.trim().length === 0) {
    console.warn('Tavily 返回的内容为空，URL:', url);
    console.warn('API 响应:', JSON.stringify(apiResult, null, 2));
    throw new Error('Tavily 提取的内容为空，可能是网页需要登录或无法访问');
  }

  // 返回标准化格式的结果
  return {
    url: apiResult.url,
    rawContent: rawContent, // 标准化为驼峰命名
    favicon: apiResult.favicon,
    images: apiResult.images,
    title: apiResult.title,
  };
}

