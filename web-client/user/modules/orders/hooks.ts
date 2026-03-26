import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "./api";
import { IOrder, IOrderDTO } from "./types";

const formatPrice = (price: number) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export const mapOrderToModel = (dto: IOrderDTO): IOrder => ({
  id: dto._id,
  status: dto.status,
  totalPrice: dto.total_price,
  formattedTotal: formatPrice(dto.total_price),
  address: dto.address,
  itemsCount: dto.items_count || dto.items?.length || 0,
  createdAt: dto.createdAt,
  formattedDate: new Date(dto.createdAt).toLocaleDateString("vi-VN", { 
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" 
  }),
});

export const useOrdersQuery = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await orderApi.getAll();
      // Backend service trả về { items: [] }
      return data.items.map(mapOrderToModel);
    },
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { address: string }) => orderApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
