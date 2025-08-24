import { QueryClient, QueryOptions } from '@tanstack/react-query';
import React from 'react';

// Create a visibility-aware query client with optimized settings
export const createVisibilityAwareQueryClient = () => {
  const queryClient = new QueryClient({
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

  // Pause all queries when tab becomes hidden
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Cancel ongoing queries to save resources
      queryClient.cancelQueries();
    } else {
      // Refetch stale queries when tab becomes visible
      queryClient.refetchQueries({
        predicate: (query) => {
          // Only refetch queries that are stale and important
          // Use a conservative approach to check staleness
          const defaultStaleTime = 2 * 60 * 1000; // 2 minutes default
          const lastUpdate = query.state.dataUpdatedAt;
          const isStale = lastUpdate < Date.now() - defaultStaleTime;
          const isImportant = query.queryKey[0] === 'pools' || 
                             query.queryKey[0] === 'prices' || 
                             query.queryKey[0] === 'user';
          return isStale && isImportant;
        },
      });
    }
  };

  // Add visibility change listener
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return queryClient;
};

// Hook to get visibility-aware refetch interval
export const useVisibilityAwareRefetchInterval = (interval: number) => {
  const [isVisible, setIsVisible] = React.useState(!document.hidden);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible ? interval : false;
};

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
export const prefetchQueries = async (queryClient: QueryClient) => {
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