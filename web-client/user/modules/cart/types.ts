import { ICakeDTO } from "../cakes/types";

export interface ICartItemDTO {
  id: string;
  cake: ICakeDTO;
  quantity: number;
  subtotal: number;
}

export interface ICartResponse {
  items: ICartItemDTO[];
  total: number;
}

export interface IAddToCartPayload {
  cake_id: string;
  quantity?: number;
}
