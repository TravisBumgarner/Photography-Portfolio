import { useMutation } from '@tanstack/react-query';
import { checkTags, generateCaptions } from '../api/client';
import type { TagCheckResult, TaggingPreview } from '../api/types';

/** Run the tagging script on a chosen photo to pre-fill caption fields. */
export function useGenerateCaptions() {
  return useMutation<TaggingPreview, Error, File>({
    mutationFn: generateCaptions,
  });
}

/** Check a batch of photos for Lightroom keywords not yet in the tag tree. */
export function useCheckTags() {
  return useMutation<TagCheckResult, Error, File[]>({
    mutationFn: checkTags,
  });
}
