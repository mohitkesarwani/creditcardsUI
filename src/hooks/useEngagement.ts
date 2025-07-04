import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEngagement, likeProduct, shareProduct, addReview } from '../api/engagement';
import { Review } from '../types';

export default function useEngagement(productId: string) {
  const queryClient = useQueryClient();
  const { data } = useQuery(['product', productId], () => getEngagement(productId));

  const like = useMutation(() => likeProduct(productId), {
    onMutate: async () => {
      await queryClient.cancelQueries(['product', productId]);
      const prev = queryClient.getQueryData<any>(['product', productId]);
      if (prev) {
        queryClient.setQueryData(['product', productId], { ...prev, likes: prev.likes + 1 });
      }
      return { prev };
    },
    onError: (_err, _var, context) => {
      if (context?.prev) queryClient.setQueryData(['product', productId], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries(['product', productId])
  });

  const share = useMutation(() => shareProduct(productId), {
    onMutate: async () => {
      await queryClient.cancelQueries(['product', productId]);
      const prev = queryClient.getQueryData<any>(['product', productId]);
      if (prev) {
        queryClient.setQueryData(['product', productId], { ...prev, shares: prev.shares + 1 });
      }
      return { prev };
    },
    onError: (_err, _var, context) => {
      if (context?.prev) queryClient.setQueryData(['product', productId], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries(['product', productId])
  });

  const review = useMutation((r: Review) => addReview(productId, r), {
    onSettled: () => queryClient.invalidateQueries(['product', productId])
  });

  return { data, like, share, review };
}
