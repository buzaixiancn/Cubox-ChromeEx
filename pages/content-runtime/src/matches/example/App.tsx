import { IS_DEV } from '@extension/env';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (IS_DEV) {
      console.log('[CEB] Example runtime content view loaded');
    }
  }, []);

  return <div className="ceb-example-runtime-content-view-text">Example runtime content view</div>;
}
