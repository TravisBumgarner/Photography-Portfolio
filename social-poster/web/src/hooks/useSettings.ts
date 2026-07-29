import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../api/client';
import type { Settings } from '../api/types';

const SETTINGS_KEY = ['settings'] as const;

export function useSettings() {
  return useQuery<Settings>({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation<Settings, Error, Partial<Settings>>({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data);
    },
  });
}
