import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

// 处理快捷键命令
// 检查 chrome.commands 是否可用（某些浏览器可能不支持）
if (typeof chrome !== 'undefined' && chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    console.log('快捷键命令触发:', command);
    if (command === 'open-popup') {
      try {
        // 先获取用户当前操作的标签页 URL，保存到 storage 中
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const targetUrl = activeTab?.url || '';
        console.log('当前标签页 URL:', targetUrl);
        
        // 将目标 URL 保存到 storage，popup 打开时会读取
        if (targetUrl) {
          await chrome.storage.local.set({ 
            'shortcut_target_url': targetUrl,
            'shortcut_timestamp': Date.now()
          });
        }
        
        // 尝试直接打开 popup（就像点击扩展图标一样）
        try {
          await chrome.action.openPopup();
          console.log('成功打开 popup');
        } catch (popupError) {
          // 如果 openPopup 失败（可能因为不在用户交互上下文中），使用备用方案
          console.warn('openPopup 失败，使用备用方案:', popupError);
          
          // 备用方案：创建新窗口（但这是最后的选择）
          const baseUrl = chrome.runtime.getURL('popup/index.html');
          const popupUrl = targetUrl 
            ? `${baseUrl}?url=${encodeURIComponent(targetUrl)}`
            : baseUrl;
          
          const [currentWindow] = await chrome.windows.getCurrent();
          const screenWidth = currentWindow.width || 1920;
          const popupWidth = 420;
          const popupHeight = 600;
          const left = screenWidth - popupWidth - 20;
          const top = 20;
          
          await chrome.windows.create({
            url: popupUrl,
            type: 'popup',
            width: popupWidth,
            height: popupHeight,
            left: left,
            top: top,
            focused: true,
          });
        }
      } catch (error) {
        console.error('打开扩展失败:', error);
      }
    }
  });
  console.log('快捷键监听器已注册');
} else {
  console.warn('chrome.commands API 不可用，快捷键功能将被禁用');
  console.log('chrome 对象:', typeof chrome !== 'undefined' ? '存在' : '不存在');
  console.log('chrome.commands:', chrome?.commands);
}
