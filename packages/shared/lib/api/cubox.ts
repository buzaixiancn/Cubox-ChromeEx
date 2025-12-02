/**
 * Cubox API 服务模块
 * 用于收藏网址到 Cubox
 */

import type { CuboxSaveParams, CuboxSaveResponse } from '../types/api.js';

/**
 * 收藏网址到 Cubox
 * @param params - 收藏参数
 * @returns Promise<CuboxSaveResponse> 收藏结果
 */
export async function saveToCubox(params: CuboxSaveParams & { apiUrl?: string }): Promise<CuboxSaveResponse> {
  // 优先使用传入的参数，否则使用环境变量
  // @ts-ignore
  const apiUrl = params.apiUrl || import.meta.env?.VITE_CUBOX_API_URL;

  if (!apiUrl) {
    throw new Error('Cubox API URL 未配置');
  }

  // 确保 URL 包含协议
  const url = params.url.startsWith('http') ? params.url : `https://${params.url}`;

  const requestBody: {
    type: string;
    content: string;
    title: string;
    description: string;
    tags: string[];
    folder: string;
    image?: string;
  } = {
    type: 'url',
    content: url,
    title: params.title,
    description: params.description,
    tags: params.tags,
    folder: params.folder || '',
  };

  // 如果有图片，添加到请求体中
  if (params.image) {
    requestBody.image = params.image;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cubox API 请求失败: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  const data = (await response.json()) as CuboxSaveResponse;

  if (data.code !== 200) {
    throw new Error(data.message || `Cubox API 返回错误: code ${data.code}`);
  }

  return data;
}

