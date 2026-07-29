import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createAccount,
  deleteAccount,
  getAccounts,
} from '../api/client';
import type {
  Account,
  AddAccountResult,
  CreateAccountInput,
} from '../api/types';

const ACCOUNTS_KEY = ['accounts'] as const;

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ACCOUNTS_KEY,
    queryFn: getAccounts,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation<AddAccountResult, Error, CreateAccountInput>({
    mutationFn: createAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      // Posts embed account targets, refresh them too.
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
