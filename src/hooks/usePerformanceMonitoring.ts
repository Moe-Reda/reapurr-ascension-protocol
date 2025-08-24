import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiCallCount: number;
  apiCallTime: number;
  rateLimitHits: number;
  cacheHitRate: number;
  averageResponseTime: number;
  errors: Array<{
    type: string;
    message: string;
    timestamp: number;
    count: number;
  }>;
}

export interface PerformanceEvent {
  type: 'api_call' | 'cache_hit' | 'cache_miss' | 'rate_limit' | 'error' | 'page_load';
  duration?: number;
  metadata?: Record<string, any>;
}

export const usePerformanceMonitoring = (pageName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiCallCount: 0,
    apiCallTime: 0,
    rateLimitHits: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    errors: [],
  });

  const pageLoadStartRef = useRef<number>(Date.now());
  const eventsRef = useRef<PerformanceEvent[]>([]);
  const apiCallTimesRef = useRef<number[]>([]);
  const cacheHitsRef = useRef<number>(0);
  const cacheMissesRef = useRef<number>(0);

  // Record a performance event
  const recordEvent = useCallback((event: PerformanceEvent) => {
    const timestamp = Date.now();
    eventsRef.current.push({ ...event, timestamp });

    setMetrics(prev => {
      let newMetrics = { ...prev };

      switch (event.type) {
        case 'api_call':
          newMetrics.apiCallCount = prev.apiCallCount + 1;
          if (event.duration) {
            apiCallTimesRef.current.push(event.duration);
            newMetrics.apiCallTime = prev.apiCallTime + event.duration;
            newMetrics.averageResponseTime = 
              newMetrics.apiCallTime / newMetrics.apiCallCount;
          }
          break;

        case 'cache_hit':
          cacheHitsRef.current++;
          break;

        case 'cache_miss':
          cacheMissesRef.current++;
          break;

        case 'rate_limit':
          newMetrics.rateLimitHits = prev.rateLimitHits + 1;
          break;

        case 'error':
          const existingError = prev.errors.find(e => 
            e.type === event.metadata?.errorType && 
            e.message === event.metadata?.errorMessage
          );
          
          if (existingError) {
            existingError.count++;
            existingError.timestamp = timestamp;
          } else {
            newMetrics.errors.push({
              type: event.metadata?.errorType || 'unknown',
              message: event.metadata?.errorMessage || 'Unknown error',
              timestamp,
              count: 1,
            });
          }
          break;

        case 'page_load':
          newMetrics.pageLoadTime = timestamp - pageLoadStartRef.current;
          break;
      }

      // Calculate cache hit rate
      const totalCacheAccess = cacheHitsRef.current + cacheMissesRef.current;
      if (totalCacheAccess > 0) {
        newMetrics.cacheHitRate = (cacheHitsRef.current / totalCacheAccess) * 100;
      }

      return newMetrics;
    });
  }, []);

  // Record API call with timing
  const recordApiCall = useCallback((duration: number, metadata?: Record<string, any>) => {
    recordEvent({
      type: 'api_call',
      duration,
      metadata,
    });
  }, [recordEvent]);

  // Record cache hit/miss
  const recordCacheAccess = useCallback((isHit: boolean) => {
    recordEvent({
      type: isHit ? 'cache_hit' : 'cache_miss',
    });
  }, [recordEvent]);

  // Record rate limit hit
  const recordRateLimit = useCallback((metadata?: Record<string, any>) => {
    recordEvent({
      type: 'rate_limit',
      metadata,
    });
  }, [recordEvent]);

  // Record error
  const recordError = useCallback((errorType: string, errorMessage: string, metadata?: Record<string, any>) => {
    recordEvent({
      type: 'error',
      metadata: {
        errorType,
        errorMessage,
        ...metadata,
      },
    });
  }, [recordEvent]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const totalEvents = eventsRef.current.length;
    const apiCalls = eventsRef.current.filter(e => e.type === 'api_call');
    const errors = eventsRef.current.filter(e => e.type === 'error');
    const rateLimits = eventsRef.current.filter(e => e.type === 'rate_limit');

    return {
      totalEvents,
      apiCalls: apiCalls.length,
      errors: errors.length,
      rateLimits: rateLimits.length,
      cacheHitRate: metrics.cacheHitRate,
      averageResponseTime: metrics.averageResponseTime,
      pageLoadTime: metrics.pageLoadTime,
    };
  }, [metrics]);

  // Export performance data for debugging
  const exportPerformanceData = useCallback(() => {
    const data = {
      pageName,
      timestamp: new Date().toISOString(),
      metrics,
      events: eventsRef.current,
      summary: getPerformanceSummary(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-${pageName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pageName, metrics, getPerformanceSummary]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      pageLoadTime: 0,
      apiCallCount: 0,
      apiCallTime: 0,
      rateLimitHits: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      errors: [],
    });
    eventsRef.current = [];
    apiCallTimesRef.current = [];
    cacheHitsRef.current = 0;
    cacheMissesRef.current = 0;
    pageLoadStartRef.current = Date.now();
  }, []);

  // Record page load completion
  useEffect(() => {
    const handleLoad = () => {
      recordEvent({ type: 'page_load' });
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [recordEvent]);

  // Log performance metrics to console in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const summary = getPerformanceSummary();
        if (summary.apiCalls > 0 || summary.errors > 0) {
          console.log(`[${pageName}] Performance Summary:`, summary);
        }
      }, 30000); // Log every 30 seconds

      return () => clearInterval(interval);
    }
  }, [pageName, getPerformanceSummary]);

  return {
    metrics,
    recordApiCall,
    recordCacheAccess,
    recordRateLimit,
    recordError,
    getPerformanceSummary,
    exportPerformanceData,
    resetMetrics,
  };
};



