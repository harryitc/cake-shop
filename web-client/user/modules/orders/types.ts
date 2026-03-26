export interface IOrderDTO {
  _id: string;
  user_id: string | { email: string };
  total_price: number;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'REJECTED';
  address: string;
  items: Array<{
    cake_id: any;
    quantity: number;
    price_at_buy: number;
  }>;
  items_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  cake_id: string | any;
  quantity: number;
  price_at_buy: number;
}

export interface IOrder {
  id: string;
  status: string;
  totalPrice: number;
  formattedTotal: string;
  address: string;
  itemsCount: number;
  items: IOrderItem[];
  createdAt: string;
  formattedDate: string;
}

export interface ICreateOrderPayload {
  address: string;
}
