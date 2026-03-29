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

export interface ILoginPayload {
  email: string;
  password?: string;
}

export interface IRegisterPayload {
  email: string;
  password?: string;
  full_name?: string;
}

export interface IChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
}

export interface IUpdateProfilePayload {
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}
