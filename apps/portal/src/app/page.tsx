import { Recipe } from '@chefos/types';
import { API_URL } from '@chefos/utils';

async function getRecipes(): Promise<Recipe[]> {
  // Fetch from the API (running on localhost:4000)
  // Note: In Docker/K8s this would be the service name, but for local dev localhost is fine.
  // We use 'no-store' to ensure dynamic data fetching (SSR)
  try {
    const res = await fetch(`${API_URL}/api/recipes`, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch recipes:', res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    // The API returns { code: 200, data: { data: [], meta: ... }, ... }
    // We need to extract json.data.data
    if (json.data && Array.isArray(json.data.data)) {
      return json.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">ChefOS Portal</h1>
        <p className="text-lg text-gray-600 mb-12">Discover our latest recipes.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{recipe.name}</h2>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>
                    Yield: {recipe.yieldQuantity} {recipe.yieldUnit}
                  </span>
                  <span>Cost: ${Number(recipe.laborCost).toFixed(2)} (Labor)</span>
                </div>
                <p className="text-gray-600 line-clamp-3">
                  {recipe.steps && recipe.steps.length > 0
                    ? recipe.steps[0]
                    : 'No steps available.'}
                </p>
                <div className="mt-4">
                  <a
                    href={`/recipe/${recipe.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No recipes found. Make sure the API is running and populated.
          </div>
        )}
      </div>
    </main>
  );
}
