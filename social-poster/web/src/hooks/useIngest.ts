import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveIngest,
  cropIngestImage,
  deleteIngestItem,
  getIngestItems,
  updateIngestItem,
  uploadIngestImages,
} from '../api/client';
import type {
  ApproveIngestInput,
  Captions,
  CropRect,
  IngestItem,
  Post,
  TagPools,
} from '../api/types';

const INGEST_KEY = ['ingest'] as const;
const POSTS_KEY = ['posts'] as const;

/** Staged ingest items; polls quickly while the tagging script is still
 * filling in captions, then stops. */
export function useIngestItems() {
  return useQuery<IngestItem[]>({
    queryKey: INGEST_KEY,
    queryFn: getIngestItems,
    refetchInterval: (query) =>
      query.state.data?.some((i) => i.tag_status === 'pending') ? 2000 : false,
  });
}

export function useUploadIngestImages() {
  const queryClient = useQueryClient();
  return useMutation<IngestItem[], Error, File[]>({
    mutationFn: uploadIngestImages,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGEST_KEY });
    },
  });
}

export function useUpdateIngestItem() {
  const queryClient = useQueryClient();
  return useMutation<
    IngestItem,
    Error,
    { id: number; captions: Captions; tagPools?: TagPools }
  >({
    mutationFn: ({ id, captions, tagPools }) =>
      updateIngestItem(id, captions, tagPools),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGEST_KEY });
    },
  });
}

export function useCropIngestImage() {
  const queryClient = useQueryClient();
  return useMutation<IngestItem, Error, { id: number; rect: CropRect }>({
    mutationFn: ({ id, rect }) => cropIngestImage(id, rect),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGEST_KEY });
    },
  });
}

export function useDeleteIngestItem() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteIngestItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGEST_KEY });
    },
  });
}

export function useApproveIngest() {
  const queryClient = useQueryClient();
  return useMutation<Post[], Error, ApproveIngestInput>({
    mutationFn: approveIngest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INGEST_KEY });
      void queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}
