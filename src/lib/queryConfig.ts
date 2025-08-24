import { QueryClient } from '@tanstack/react-query';

// React Query configuration for optimal performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent unnecessary refetches when window regains focus
      refetchOnWindowFocus: false,
      
      // Prevent background refetching to reduce API calls
      refetchIntervalInBackground: false,
      
      // Keep data fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests up to 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Show loading state immediately for better UX
      placeholderData: undefined,
      
      // Optimize for real-time data
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    
    mutations: {
      // Retry failed mutations up to 2 times
      retry: 2,
      
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Custom query options for different data types
export const queryOptions = {
  // Pool data that doesn't change frequently
  poolData: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,   // 15 minutes
    refetchInterval: 30000,    // 30 seconds
  },
  
  // User data that changes more frequently
  userData: {
    staleTime: 30 * 1000,     // 30 seconds
    gcTime: 5 * 60 * 1000,    // 5 minutes
    refetchInterval: 15000,    // 15 seconds
  },
  
  // Price data that needs to be fresh
  priceData: {
    staleTime: 10 * 1000,     // 10 seconds
    gcTime: 2 * 60 * 1000,    // 2 minutes
    refetchInterval: 60000,    // 1 minute
  },
  
  // Contract data that rarely changes
  contractData: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchInterval: 300000,    // 5 minutes
  },
};

// Prefetch important data
export const prefetchQueries = async () => {
  // Prefetch pool data
  await queryClient.prefetchQuery({
    queryKey: ['pools', 'genesis'],
    queryFn: () => Promise.resolve([]), // Placeholder
    ...queryOptions.poolData,
  });
  
  // Prefetch contract addresses
  await queryClient.prefetchQuery({
    queryKey: ['contracts', 'addresses'],
    queryFn: () => Promise.resolve({}), // Placeholder
    ...queryOptions.contractData,
  });
};

// Optimize queries when tab becomes visible
export const optimizeQueriesOnVisibilityChange = () => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Tab became visible - refetch stale data
      queryClient.refetchQueries({
        predicate: (query) => {
          // Only refetch queries that are stale and important
          const isStale = query.state.dataUpdatedAt < Date.now() - (query.options.staleTime || 0);
          const isImportant = query.queryKey[0] === 'pools' || 
                             query.queryKey[0] === 'prices' || 
                             query.queryKey[0] === 'user';
          return isStale && isImportant;
        },
      });
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};



