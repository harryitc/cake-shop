export interface ILoginPayload {
  email: string;
  password?: string;
}

export interface IUserInfo {
  id: string;
  email: string;
  role: string;
}

export interface IAuthResponse {
  token: string;
  user: IUserInfo;
}
