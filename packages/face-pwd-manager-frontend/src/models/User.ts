export interface User {
  id: number;
  email: string;
  token: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  selfie?: Blob;
}
