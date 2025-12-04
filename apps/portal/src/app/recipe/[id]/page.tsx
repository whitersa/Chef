import { Recipe } from '@chefos/types';
import Link from 'next/link';
import { API_URL } from '@chefos/utils';

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_URL}/api/recipes/${id}`, { cache: 'no-store' });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

export default async function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              &larr; Back to Recipes
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.name}</h1>

          <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-600">
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              Yield: {recipe.yieldQuantity} {recipe.yieldUnit}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              Labor Cost: ${Number(recipe.laborCost).toFixed(2)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
              <p className="text-gray-500 italic">Ingredients list coming soon...</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.steps &&
                  recipe.steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 mt-1">{step}</p>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
