try {
  // 使用 process.env 检查开发模式（由 withPageConfig 定义）
  if (process.env.CLI_CEB_DEV === 'true') {
    console.log("Edit 'pages/devtools/src/index.ts' and save to reload.");
  }
  chrome.devtools.panels.create('Dev Tools', '/icon-34.png', '/devtools-panel/index.html');
} catch (e) {
  console.error(e);
}
