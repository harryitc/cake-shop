export interface IUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  loyalty_points?: number;
  total_spent?: number;
  rank?: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  createdAt: string;
  updatedAt: string;
}

export interface ILoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface IUpdateProfilePayload {
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}
