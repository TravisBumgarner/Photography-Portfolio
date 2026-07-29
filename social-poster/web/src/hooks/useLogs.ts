import { useQuery } from '@tanstack/react-query';
import { getLogs } from '../api/client';
import type { LogEntry } from '../api/types';

export function useLogs() {
  return useQuery<LogEntry[]>({
    queryKey: ['logs'],
    queryFn: getLogs,
    // Poll so new publish attempts appear without a manual refresh.
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}
