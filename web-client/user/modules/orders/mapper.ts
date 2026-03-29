import { IOrderDTO } from "./types";

export const mapOrderToModel = (dto: IOrderDTO) => {
  return {
    id: dto._id,
    order_number: dto.order_number,
    total_price: dto.total_price,
    status: dto.status,
    items: dto.items.map(item => ({
      cake_id: item.cake_id,
      cake_name: item.cake_name,
      cake_image: item.cake_image,
      quantity: item.quantity,
      price: item.price,
    })),
    address: dto.address,
    createdAt: dto.createdAt,
  };
};

export type OrderModel = ReturnType<typeof mapOrderToModel>;
