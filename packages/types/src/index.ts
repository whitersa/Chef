export interface Ping {
  message: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export * from './dtos/create-ingredient.dto';
