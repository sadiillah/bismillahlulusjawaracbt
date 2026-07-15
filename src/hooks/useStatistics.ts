import { useQuery } from '@tanstack/react-query';
import statisticsService from '../api/statisticsService';

/**
 * Hook to fetch statistics for specified entities
 * @param entities - Array of entity types to get statistics for
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns React Query result with statistics data
 */
export const useStatistics = (entities: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ['statistics', entities.sort().join(',')],
    queryFn: () => statisticsService.getStatistics(entities),
    enabled: enabled && entities.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};