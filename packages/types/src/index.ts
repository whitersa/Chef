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

export interface Cuisine {
  id: string;
  name: string;
  description?: string;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cuisineId?: string;
  cuisine?: Cuisine;
}

export type ProcessingStepType = 'recommended' | 'mandatory' | 'optional';

export interface ProcessingStep {
  description: string;
  type: ProcessingStepType;
}

export interface Recipe {
  id: string;
  dishId?: string;
  dish?: Dish;
  variantName: string;
  name: string;
  steps: string[];
  preProcessing: ProcessingStep[];
  yieldQuantity: number;
  yieldUnit: string;
  laborCost: number;
  items?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export * from './dtos/create-ingredient.dto';
export * from './dtos/create-recipe.dto';
