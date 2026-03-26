export interface IUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
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
