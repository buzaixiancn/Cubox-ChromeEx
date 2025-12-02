/**
 * 环境变量类型定义
 * 用于支持 Vite 环境变量的类型检查
 */

declare global {
  interface ImportMetaEnv {
    /** OpenAI API Key */
    readonly VITE_OPENAI_API_KEY?: string;
    /** OpenAI API 端点 */
    readonly VITE_OPENAI_API_ENDPOINT?: string;
    /** Cubox API URL */
    readonly VITE_CUBOX_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};

