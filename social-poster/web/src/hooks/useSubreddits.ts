import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteSubreddit,
  deleteSubredditCategory,
  getSubredditCategories,
  getSubreddits,
  importSubreddits,
  saveSubreddit,
  saveSubredditCategory,
  suggestSubreddits,
} from '../api/client';
import type {
  RedditSuggestions,
  SubredditCategory,
  SubredditRules,
} from '../api/types';

const SUBREDDITS_KEY = ['subreddits'];
const CATEGORIES_KEY = ['subreddit-categories'];

/** The per-sub posting rules. Rarely change, so a long stale time is fine. */
export function useSubreddits() {
  return useQuery<SubredditRules[]>({
    queryKey: SUBREDDITS_KEY,
    queryFn: getSubreddits,
    staleTime: 5 * 60 * 1000,
  });
}

/** Category quick-selects, each listing the subs it selects. */
export function useSubredditCategories() {
  return useQuery<SubredditCategory[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: getSubredditCategories,
    staleTime: 5 * 60 * 1000,
  });
}

/** A category's subs are derived from the subs' own `categories`, so saving
 * either one invalidates both queries. */
function useInvalidateBoth() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: SUBREDDITS_KEY });
    void client.invalidateQueries({ queryKey: CATEGORIES_KEY });
  };
}

export function useSaveSubreddit() {
  const invalidate = useInvalidateBoth();
  return useMutation<
    SubredditRules,
    Error,
    { name: string; input: Partial<SubredditRules> }
  >({
    mutationFn: ({ name, input }) => saveSubreddit(name, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSubreddit() {
  const invalidate = useInvalidateBoth();
  return useMutation<void, Error, string>({
    mutationFn: deleteSubreddit,
    onSuccess: invalidate,
  });
}

export function useImportSubreddits() {
  const invalidate = useInvalidateBoth();
  return useMutation({
    mutationFn: importSubreddits,
    onSuccess: invalidate,
  });
}

export function useSaveSubredditCategory() {
  const invalidate = useInvalidateBoth();
  return useMutation<
    SubredditCategory,
    Error,
    { name: string; keyword_prefixes: string[] }
  >({
    mutationFn: ({ name, keyword_prefixes }) =>
      saveSubredditCategory(name, { keyword_prefixes }),
    onSuccess: invalidate,
  });
}

export function useDeleteSubredditCategory() {
  const invalidate = useInvalidateBoth();
  return useMutation<void, Error, string>({
    mutationFn: deleteSubredditCategory,
    onSuccess: invalidate,
  });
}

/** Suggest subs for a chosen photo, with a title pre-rendered for each. */
export function useSuggestSubreddits() {
  return useMutation<RedditSuggestions, Error, File>({
    mutationFn: suggestSubreddits,
  });
}
