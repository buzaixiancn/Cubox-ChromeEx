# Content UI Script

This tool allows you to inject React Components into all pages specified by you.

### Add New Script

1. Create a new folder in `matches/` directory (e.g., `matches/my-ui`) and add your React component.

   > [!NOTE]
   > Remember to import your component:
   > ```ts
   > import App from '@src/matches/{your_folder}/App';
   > ```

2. Edit `manifest.ts`:
- In `content-scripts` section add object with:

```ts
{
  matches: ['URL_FOR_INJECT'], 
  js: ['content-ui/{matches_folder_name}.iife.js']
}
```