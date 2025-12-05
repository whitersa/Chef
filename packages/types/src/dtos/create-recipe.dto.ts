import { ProcessingStep } from '../index';

export interface CreateRecipeDto {
  name: string;
  steps?: string[];
  preProcessing?: ProcessingStep[];
  items?: Array<{
    quantity: number;
    yieldRate?: number;
    ingredientId?: string;
    childRecipeId?: string;
  }>;
}
