import { Recipe } from '@chefos/types';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // Helper to get a description from dish, steps or preProcessing
  const description =
    recipe.dish?.description ||
    (recipe.steps && recipe.steps.length > 0
      ? recipe.steps[0]
      : recipe.preProcessing && recipe.preProcessing.length > 0
        ? recipe.preProcessing[0]
        : 'No description available.');

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        {recipe.dish?.imageUrl ? (
          <img
            src={recipe.dish.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50 group-hover:scale-105 transition-transform duration-500">
            <span className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-500">
              🥘
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
          30 min
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold tracking-wider uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Recipe
          </span>
          <div className="flex items-center text-gray-400 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {recipe.yieldQuantity} {recipe.yieldUnit}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {recipe.name}
        </h3>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
          {description}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
              CH
            </div>
            <span className="text-xs font-medium text-gray-600">ChefOS</span>
          </div>
          <button className="text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center group/btn">
            View Recipe
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
