export interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export interface RecipeItem {
  quantity: number;
  ingredient?: Ingredient;
  childRecipe?: Recipe;
}

export interface ProcessingStep {
  type: string;
  description: string;
}

export interface Recipe {
  id: string;
  name: string;
  variantName?: string;
  items?: RecipeItem[];
  preProcessing?: ProcessingStep[];
  steps?: string[];
  [key: string]: any;
}
