import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createPost,
  deletePost,
  deleteTarget,
  editPost,
  getPosts,
  sendPostNow,
  sendTargetNow,
  snapshotPostEngagement,
  updatePost,
} from '../api/client';
import type {
  CreatePostInput,
  EditPostInput,
  EngagementSnapshotResult,
  Post,
  UpdatePostInput,
} from '../api/types';

const POSTS_KEY = ['posts'] as const;

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: POSTS_KEY,
    queryFn: getPosts,
    // The publisher (a separate process) updates target statuses in the DB on
    // its ~1-min tick. Poll so a post flipping to "posted"/"failed" — and the
    // overdue flag clearing — show up on their own without a manual refresh.
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, CreatePostInput>({
    mutationFn: createPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

interface UpdatePostVariables {
  id: number;
  input: UpdatePostInput;
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, UpdatePostVariables>({
    mutationFn: ({ id, input }) => updatePost(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

interface EditPostVariables {
  id: number;
  input: EditPostInput;
}

export function useEditPost() {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, EditPostVariables>({
    mutationFn: ({ id, input }) => editPost(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

export function useSendPostNow() {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, number>({
    mutationFn: sendPostNow,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

/** Publish/retry one account's record (photo×account). */
export function useSendTargetNow() {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, number>({
    mutationFn: sendTargetNow,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

/** Delete one account's record (photo×account). */
export function useDeleteTarget() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteTarget,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

/** Fetch fresh like/comment/repost counts for a post's published targets. */
export function useSnapshotEngagement() {
  const queryClient = useQueryClient();
  return useMutation<
    { results: EngagementSnapshotResult[]; post: Post },
    Error,
    number
  >({
    mutationFn: snapshotPostEngagement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deletePost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}
