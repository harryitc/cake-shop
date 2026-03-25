export interface IOrder {
  id: string;
  status: string;
  total_price: number;
  formattedTotal: string;
  address: string;
  items_count: number;
  createdAt: string;
  formattedDate: string;
}

export interface ICreateOrderPayload {
  address: string;
}
