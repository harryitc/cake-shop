import { ICakeDTO, IVariant } from "../cakes/types";

export interface ICartItemDTO {
  id: string;
  cake: ICakeDTO;
  variant_id?: string | null;
  variant?: IVariant | null;
  quantity: number;
  price?: number;
  subtotal: number;
}

export interface ICartResponse {
  items: ICartItemDTO[];
  total: number;
}

export interface IAddToCartPayload {
  cake_id: string;
  variant_id?: string | null;
  quantity?: number;
}
