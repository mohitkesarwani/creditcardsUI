import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEngagementForEntity, likeEntity, shareEntity, addEntityReview } from '../api/engagement';
import { Review } from '../types';

export default function useEntityEngagement(id: string, entityType: string) {
  const queryClient = useQueryClient();
  const key = ['engagement', entityType, id];
  const { data, isLoading } = useQuery(key, () => getEngagementForEntity(id, entityType));

  const like = useMutation(() => likeEntity(id, entityType), {
    onSettled: () => queryClient.invalidateQueries(key),
  });

  const share = useMutation(() => shareEntity(id, entityType), {
    onSettled: () => queryClient.invalidateQueries(key),
  });

  const review = useMutation((r: Review) => addEntityReview(id, entityType, r), {
    onSettled: () => queryClient.invalidateQueries(key),
  });

  return { data, isLoading, like, share, review };
}
