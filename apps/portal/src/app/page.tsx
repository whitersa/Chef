import { Recipe } from '@chefos/types';
import { API_URL } from '@chefos/utils';
import { Hero } from '../components/Hero';
import { RecipeCard } from '../components/RecipeCard';

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
    <>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Recipes</h2>
          <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
            View All &rarr;
          </a>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-500">
              It seems we haven't added any recipes yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
