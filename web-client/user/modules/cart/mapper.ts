import { ICartResponse } from "./types";

export const mapCartToModel = (dto: ICartResponse) => {
  return {
    items: dto.items.map(item => ({
      id: item._id,
      cake_id: item.cake._id,
      name: item.cake.name,
      image: item.cake.image,
      price: item.cake.price,
      quantity: item.quantity,
      subtotal: item.cake.price * item.quantity,
    })),
    total: dto.total,
  };
};

export type CartModel = ReturnType<typeof mapCartToModel>;
