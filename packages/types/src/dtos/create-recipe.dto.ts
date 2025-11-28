export interface CreateRecipeDto {
  name: string;
  steps?: string[];
  preProcessing?: string[];
  items?: Array<{
    quantity: number;
    yieldRate?: number;
    ingredientId?: string;
    childRecipeId?: string;
  }>;
}
