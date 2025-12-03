import { IS_DEV } from '@extension/env';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (IS_DEV) {
      console.log('[CEB] All runtime content view loaded');
    }
  }, []);

  return <div className="ceb-all-runtime-content-view-text">All runtime content view</div>;
}
