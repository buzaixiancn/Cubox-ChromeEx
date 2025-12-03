import { IS_DEV } from '@extension/env';
import { sampleFunction } from '@src/sample-function';

if (IS_DEV) {
  console.log('[CEB] Example content script loaded');
}

void sampleFunction();
