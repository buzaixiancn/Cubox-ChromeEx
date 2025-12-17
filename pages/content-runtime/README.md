# Content Runtime Script

This tool allows users to inject scripts (Console and UI) during runtime into all pages specified by you.

### Add New Script

1. Create a new folder in `matches/` directory (e.g., `matches/my-runtime`) and add your runtime script.
2. Define somewhere(e.g in `popup`(You have declared it as default)):

```ts
await chrome.scripting.executeScript({
  ...,
  files: ['/content-runtime/{matches_folder_name}.iife.js'],
})
```
