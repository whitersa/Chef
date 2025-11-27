export interface Ping {
  message: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  density?: 'compact' | 'default' | 'loose';
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  hireDate: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export * from './dtos/create-ingredient.dto';
