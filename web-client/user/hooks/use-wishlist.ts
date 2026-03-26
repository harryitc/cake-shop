import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "../services/api.wishlist";
import { useMeQuery } from "../modules/auth/hooks";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const { data: user } = useMeQuery({
    staleTime: Infinity, // Profile ít thay đổi
  });

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.getWishlist(),
    enabled: !!user, // Chỉ gọi khi đã đăng nhập
  });

  const toggleMutation = useMutation({
    mutationFn: (cakeId: string) => wishlistService.toggleWishlist(cakeId),
    onSuccess: () => {
      // Refresh lại data sau khi thay đổi
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const isLiked = (cakeId: string) => {
    return wishlist?.cakes.some((cake: any) => cake._id === cakeId) || false;
  };

  return {
    wishlist,
    isLoading,
    toggleWishlist: toggleMutation.mutate,
    isPending: toggleMutation.isPending,
    isLiked,
  };
};
