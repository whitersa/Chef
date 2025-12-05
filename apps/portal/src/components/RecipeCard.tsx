import { Recipe } from '@chefos/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // Helper to get a description from steps or preProcessing
  const description =
    recipe.steps && recipe.steps.length > 0
      ? recipe.steps[0]
      : recipe.preProcessing && recipe.preProcessing.length > 0
        ? recipe.preProcessing[0]
        : 'No description available.';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-200">
        {/* Placeholder for recipe image - in a real app, this would be a dynamic URL */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <span className="text-4xl">🥘</span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            Recipe
          </span>
          <span className="text-gray-400 text-xs flex items-center">
            Yield: {recipe.yieldQuantity} {recipe.yieldUnit}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{recipe.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{description}</p>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 overflow-hidden">
              {/* Placeholder for user avatars */}
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300"></div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400"></div>
            </div>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View Recipe →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
