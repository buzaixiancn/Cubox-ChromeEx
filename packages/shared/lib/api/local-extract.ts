/**
 * 本地内容提取服务模块
 * 使用 Chrome Extension API 直接从页面 DOM 提取内容，不依赖外部 API
 */

import type { LocalExtractResult } from '../types/api.js';

/**
 * 注入到页面的内容提取脚本
 * 这个脚本会在目标页面的上下文中执行，可以访问完整的 DOM
 */
const EXTRACT_CONTENT_SCRIPT = () => {
  // 提取页面标题
  const title = document.title || '';

  // 尝试找到主要内容区域
  const getMainContent = (): Element | null => {
    // 优先级顺序：main > article > [role="main"] > body
    return (
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.body
    );
  };

  // 提取文本内容，去除脚本和样式
  const extractText = (element: Element): string => {
    const clone = element.cloneNode(true) as Element;
    
    // 移除不需要的元素
    const removeSelectors = [
      'script',
      'style',
      'noscript',
      'iframe',
      'nav',
      'header',
      'footer',
      'aside',
      '[role="navigation"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      '[role="complementary"]',
      '.advertisement',
      '.ad',
      '.ads',
      '.sidebar',
      '.comment',
      '.comments',
      '.social-share',
      '.share-buttons',
    ];

    removeSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 获取文本内容
    const text = clone.textContent || clone.innerText || '';
    
    // 清理多余的空白字符
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

  const mainContent = getMainContent();
  const rawContent = mainContent ? extractText(mainContent) : '';

  // 提取图片 URL（用于快照）
  const images: string[] = [];
  const imageElements = document.querySelectorAll('img');
  
  imageElements.forEach(img => {
    const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
    if (src && 
        !src.startsWith('data:') && 
        !src.startsWith('blob:') &&
        src.startsWith('http')) {
      // 避免重复
      if (!images.includes(src)) {
        images.push(src);
      }
    }
  });

  // 限制图片数量，只取前 5 张
  const limitedImages = images.slice(0, 5);

  // 提取 favicon
  const getFavicon = (): string | undefined => {
    const links = document.querySelectorAll('link[rel*="icon"]');
    for (const link of Array.from(links)) {
      const href = link.getAttribute('href');
      if (href) {
        try {
          // 如果是相对路径，转换为绝对路径
          return new URL(href, window.location.href).href;
        } catch {
          return href;
        }
      }
    }
    // 如果没有找到，返回默认 favicon
    try {
      return new URL('/favicon.ico', window.location.href).href;
    } catch {
      return undefined;
    }
  };

  const favicon = getFavicon();

  return {
    title,
    rawContent,
    images: limitedImages,
    favicon,
  };
};

/**
 * 本地提取网页内容
 * 使用 chrome.scripting.executeScript 注入脚本到目标标签页，提取 DOM 内容
 * 
 * @param url - 要提取内容的网址
 * @param tabId - 目标标签页 ID（可选，如果不提供则使用当前活动标签页）
 * @returns Promise<LocalExtractResult> 提取结果
 */
export async function extractUrlContentLocal(
  url: string,
  tabId?: number
): Promise<LocalExtractResult> {
  // 检查 Chrome Extension API 是否可用
  if (typeof chrome === 'undefined' || !chrome.scripting) {
    throw new Error('Chrome Extension API 不可用');
  }

  // 获取目标标签页 ID
  let targetTabId = tabId;
  if (!targetTabId) {
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!activeTab || !activeTab.id) {
        throw new Error('无法获取当前活动标签页');
      }
      targetTabId = activeTab.id;
    } catch (error) {
      throw new Error(`获取标签页失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 注入脚本提取内容
  let extractResult: {
    title: string;
    rawContent: string;
    images: string[];
    favicon?: string;
  };

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: targetTabId },
      func: EXTRACT_CONTENT_SCRIPT,
      world: 'MAIN', // 在页面主世界执行，可以访问完整的 DOM
    });

    if (!results || results.length === 0) {
      throw new Error('内容提取脚本执行失败');
    }

    extractResult = results[0].result as typeof extractResult;

    if (!extractResult) {
      throw new Error('内容提取结果为空');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 特殊处理：某些页面无法注入脚本（如 chrome:// 页面）
    if (errorMessage.includes('Cannot access') || errorMessage.includes('Cannot access a chrome')) {
      throw new Error('无法访问此页面内容（可能是 Chrome 内部页面）');
    }
    
    throw new Error(`内容提取失败: ${errorMessage}`);
  }

  // 验证提取的内容
  if (!extractResult.rawContent || extractResult.rawContent.trim().length === 0) {
    throw new Error('提取的内容为空，可能是页面结构特殊或内容需要登录访问');
  }

  // 获取页面截图（用于 Cubox 快照）
  let screenshot: string | undefined;
  try {
    // 获取标签页所属的窗口
    const tab = await chrome.tabs.get(targetTabId);
    if (tab.windowId) {
      screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: 'png',
        quality: 90,
      });
    }
  } catch (error) {
    console.warn('获取页面截图失败:', error);
    // 截图失败不影响主要内容提取
  }

  // 如果有截图，将其添加到图片数组中（作为第一张）
  const images = screenshot
    ? [screenshot, ...(extractResult.images || [])]
    : extractResult.images || [];

  // 返回标准化格式的结果
  return {
    url,
    rawContent: extractResult.rawContent,
    title: extractResult.title || undefined,
    images: images.length > 0 ? images : undefined,
    favicon: extractResult.favicon,
  };
}

