/**
 * OpenAI API 服务模块
 * 用于分析网址并生成中文标题、描述、标签
 */

import type { OpenAIAnalysisResult, OpenAIRequestParams } from '../types/api.js';

/**
 * 调用 OpenAI API 分析网址
 * @param params - 请求参数
 * @returns Promise<OpenAIAnalysisResult> 分析结果
 */
export async function analyzeUrlWithOpenAI(
  params: OpenAIRequestParams
): Promise<OpenAIAnalysisResult> {
  // 优先使用传入的参数，否则使用环境变量
  // @ts-ignore
  const apiKey = params.apiKey || import.meta.env?.VITE_OPENAI_API_KEY;
  // @ts-ignore
  const apiEndpoint = params.apiEndpoint || import.meta.env?.VITE_OPENAI_API_ENDPOINT || 'https://api.chatanywhere.tech';
  const model = params.model || 'gpt-3.5-turbo';

  if (!apiKey) {
    throw new Error('OpenAI API Key 未配置');
  }

  // 如果提供了内容，使用内容；否则使用 URL
  const contentToAnalyze = params.content || `网址：${params.url}`;
  
  // 检测网址类型和平台
  const url = params.url.toLowerCase();
  const isGitHub = url.includes('github.com');
  const isGitLab = url.includes('gitlab.com');
  const isCodeRepo = isGitHub || isGitLab || url.includes('gitee.com') || url.includes('bitbucket.org');
  
  // 检测常见平台（使用完整的中文平台名称）
  let platformName = '';
  if (url.includes('bilibili.com')) {
    platformName = '哔哩哔哩';
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    platformName = 'YouTube';
  } else if (url.includes('github.com')) {
    platformName = 'GitHub';
  } else if (url.includes('gitlab.com')) {
    platformName = 'GitLab';
  } else if (url.includes('gitee.com')) {
    platformName = 'Gitee';
  } else if (url.includes('zhihu.com')) {
    platformName = '知乎';
  } else if (url.includes('weibo.com')) {
    platformName = '微博';
  } else if (url.includes('douyin.com') || url.includes('tiktok.com')) {
    platformName = '抖音';
  } else if (url.includes('xiaohongshu.com') || url.includes('xiaohongshu')) {
    platformName = '小红书';
  } else if (url.includes('juejin.cn')) {
    platformName = '稀土掘金'; // 使用完整平台名称
  } else if (url.includes('csdn.net')) {
    platformName = 'CSDN';
  } else if (url.includes('segmentfault.com')) {
    platformName = '思否';
  }
  
  let typeSpecificInstructions = '';
  if (isCodeRepo) {
    // 对于代码仓库，需要同时包含平台名称和项目名称，平台名称放在最后
    const repoFormat = platformName 
      ? `"[项目名称] - [项目描述] - [${platformName}]" 或 "[项目名称] - [项目描述] - ${platformName}"`
      : `"[项目名称] - [项目描述]"`;
    typeSpecificInstructions = `
重要提示：这是一个代码仓库页面，标题必须同时包含项目名称（通常是仓库名）和平台名称。
标题格式应为：${repoFormat}
例如：${platformName === 'GitHub' ? '"arco-design - 字节跳动企业级设计系统 - [GitHub]" 或 "arco-design - 字节跳动企业级设计系统 - GitHub"' : '"[项目名称] - [项目描述]"'}
项目名称和平台名称都是必需的，平台名称必须放在标题最后，不能省略。`;
  }
  
  // 平台相关提示（更强制的要求）
  let platformInstructions = '';
  if (platformName) {
    const titleExample = isCodeRepo 
      ? `如果是 GitHub 代码仓库，标题应为 "[GitHub] arco-design - 字节跳动企业级设计系统" 或 "GitHub - arco-design - 字节跳动企业级设计系统"`
      : `如果是哔哩哔哩视频，标题应为 "[哔哩哔哩] 视频标题" 或 "哔哩哔哩 - 视频标题"；如果是稀土掘金文章，标题应为 "[稀土掘金] 文章标题" 或 "稀土掘金 - 文章标题"`;
    
    platformInstructions = `
【强制要求】这是一个来自 ${platformName} 平台的内容，必须严格遵守以下规则：
1. 标题格式要求：
   - 标题最后必须包含平台名称 "${platformName}" 作为标注
   - 推荐格式："内容标题 - [${platformName}]" 或 "内容标题 - ${platformName}"
   - 示例：如果是哔哩哔哩视频，标题应为 "视频标题 - [哔哩哔哩]"；如果是稀土掘金文章，标题应为 "文章标题 - [稀土掘金]"；如果是 GitHub 代码仓库，标题应为 "项目名称 - 项目描述 - [GitHub]"
   - 平台名称 "${platformName}" 必须放在标题最后，绝对不能省略
2. 标签要求：
   - 标签数组中必须包含 "${platformName}" 作为第一个或前几个标签之一
   - 这是强制要求，不能省略，即使内容类型是代码仓库也必须包含平台名称标签
3. 内容类型识别：
   - 如果内容类型明确（如视频、文章、代码仓库、教程、博客等），也应该在标题和标签中体现`;
  }
  
  const prompt = `请仔细分析以下网页内容，确保不遗漏任何关键信息，并生成：

1. 一个简洁的中文标题（不超过40字）
${typeSpecificInstructions}
${platformInstructions}

2. 一段详细的中文描述（80-150字，必须包含所有关键信息）
   【重要】描述要求：
   - 必须包含：核心功能、主要特性、技术栈、适用场景、项目名称（如有）、作者信息（如有）、发布时间（如有）等所有关键信息
   - 不要遗漏任何重要的技术细节、功能特性、使用场景
   - 专注于网页的实际内容和功能，不要包含"用户可以通过...访问"、"该网页介绍了..."等冗余表述
   - 避免使用："用户可以通过...访问"、"该网页介绍了..."、"可以通过...获取"等表述
   - 直接描述内容本身，例如："基于 Vue 3 的管理后台框架，提供完整的权限管理和数据可视化功能"
   - 如果是技术文章，必须包含文章主题、涉及的技术栈、解决的问题等关键信息
   - 如果是项目/代码仓库，必须包含项目名称、主要功能、技术栈、适用场景等

3. 8-15个中文标签（用数组格式返回）
   【强制要求】：
   - 如果识别到平台，标签数组中必须包含平台名称 "${platformName || '平台名称'}"（这是强制要求，不能省略）
   - 必须包含所有相关的技术栈标签（如 Vue、React、TypeScript、Python 等）
   - 必须包含内容类型标签（如 视频、文章、教程、代码仓库、博客 等）
   - 必须包含功能特性标签（如 组件库、管理后台、API、工具 等）
   - 必须包含应用场景标签（如 前端开发、后端开发、全栈、学习 等）
   - 标签要具体、有意义、便于检索，不要使用过于宽泛的标签
   - 确保标签覆盖内容的所有重要方面，不遗漏关键信息

【分析要求】：
- 仔细阅读网页内容，提取所有关键信息
- 不要遗漏项目名称、技术栈、功能特性、作者、发布时间等任何重要信息
- 确保标题、描述、标签都准确反映内容的完整信息

网址：${params.url}
${contentToAnalyze}

请以 JSON 格式返回，格式如下：
{
  "title": "标题（必须包含平台名称）",
  "description": "描述（包含所有关键信息）",
  "tags": ["平台名称标签", "技术栈标签1", "技术栈标签2", "内容类型标签", "功能特性标签", "应用场景标签", "其他相关标签"]
}`;

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user' as const,
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 800, // 增加 token 限制以支持更多标签和更详细的描述
  };

  const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenAI API 请求失败: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'OpenAI API 错误');
  }

  const content = data.choices?.[0]?.message?.content || '';

  if (!content) {
    throw new Error('OpenAI API 返回内容为空');
  }

  // 尝试解析 JSON
  try {
    const parsed = JSON.parse(content) as OpenAIAnalysisResult;
    
    // 验证返回的数据结构
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.tags)) {
      throw new Error('OpenAI API 返回的数据格式不正确');
    }

    return parsed;
  } catch (parseError) {
    // 如果不是标准 JSON，尝试从文本中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as OpenAIAnalysisResult;
        
        if (!parsed.title || !parsed.description || !Array.isArray(parsed.tags)) {
          throw new Error('OpenAI API 返回的数据格式不正确');
        }

        return parsed;
      } catch (e) {
        throw new Error(`无法解析 OpenAI API 返回的 JSON 格式: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      throw new Error('无法从 OpenAI API 响应中提取 JSON 数据');
    }
  }
}

