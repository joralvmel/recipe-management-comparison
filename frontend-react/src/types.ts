export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt?: number;
  [key: string]: unknown;
}