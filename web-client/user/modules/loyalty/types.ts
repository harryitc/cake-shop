export interface IPointHistory {
  _id: string;
  points_change: number;
  type: 'PLUS' | 'MINUS';
  reason: string;
  createdAt: string;
}

export interface ILoyaltyInfo {
  rank: string;
  loyalty_points: number;
  total_spent: number;
  history: IPointHistory[];
}
