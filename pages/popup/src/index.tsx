import '@src/index.css';
import Popup from '@src/Popup';
import { createRoot } from 'react-dom/client';

const init = () => {
  try {
    const appContainer = document.querySelector('#app-container');
    if (!appContainer) {
      document.body.innerHTML = '<div style="padding: 20px; color: red;">错误：找不到 #app-container</div>';
      return;
    }
    
    const root = createRoot(appContainer);
    root.render(<Popup />);
  } catch (error) {
    console.error('初始化失败:', error);
    if (document.body) {
      document.body.innerHTML = `
        <div style="padding: 20px; color: red;">
          <h2>初始化错误</h2>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
          <pre>${error instanceof Error ? error.stack : ''}</pre>
        </div>
      `;
    }
  }
};

init();
