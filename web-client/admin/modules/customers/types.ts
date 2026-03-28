export interface ICustomerDTO {
  _id: string;
  email: string;
  full_name: string;
  phone: string;
  address?: string;
  avatar_url?: string;
  role: string;
  loyalty_points: number;
  total_spent: number;
  total_orders: number;
  rank: string;
  rank_lock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ILoyaltyStats {
  totalUsers: number;
  totalPointsIssued: number;
  vipCount: number;
  nearUpgradeCount: number;
}

export interface ILoyaltyConfig {
  tier_thresholds: {
    SILVER: number;
    GOLD: number;
    DIAMOND: number;
    [key: string]: number;
  };
  point_ratios: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    DIAMOND: number;
    [key: string]: number;
  };
  max_point_discount_percentage: number;
  point_to_vnd_ratio: number;
}

export interface IRankOverridePayload {
  rank: string;
  rank_lock: boolean;
}

export interface IPointHistoryDTO {
  _id: string;
  user: string | any;
  order?: string | any;
  admin?: string | any;
  points_change: number;
  type: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdjustPointsPayload {
  points: number;
  reason: string;
}

export interface IGetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  rank?: string;
}

export interface IGetPointHistoryParams {
  page?: number;
  limit?: number;
}
