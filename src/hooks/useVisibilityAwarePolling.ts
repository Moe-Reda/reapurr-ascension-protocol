import { useEffect, useRef, useState } from 'react';

interface UseVisibilityAwarePollingOptions {
  interval: number;
  enabled?: boolean;
  immediate?: boolean;
}

export const useVisibilityAwarePolling = (
  callback: () => void | Promise<void>,
  options: UseVisibilityAwarePollingOptions
) => {
  const { interval, enabled = true, immediate = true } = options;
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      setIsVisible(newVisibility);

      if (newVisibility) {
        // Tab became visible - restart polling
        if (enabled) {
          callback(); // Execute immediately
          intervalRef.current = setInterval(callback, interval);
        }
      } else {
        // Tab became hidden - stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callback, interval, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial execution
    if (immediate && isVisible) {
      callback();
    }

    // Set up interval only if visible
    if (isVisible) {
      intervalRef.current = setInterval(callback, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callback, interval, enabled, immediate, isVisible]);

  return {
    isVisible,
    isPolling: enabled && isVisible && intervalRef.current !== null,
  };
}; 