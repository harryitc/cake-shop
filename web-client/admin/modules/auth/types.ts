export interface IUser {
  _id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar_url?: string;
  address?: string;
  createdAt: string;
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

export interface ILoginResponse {
  token: string;
  user: IUser;
}
