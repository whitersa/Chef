import { Recipe } from '@chefos/types';
import Link from 'next/link';
import { API_URL } from '@chefos/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/MotionWrapper';

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
      <FadeIn className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              &larr; Back to Recipes
            </Link>
          </div>

          {recipe.dish?.imageUrl && (
            <FadeIn
              delay={0.2}
              className="mb-8 rounded-xl overflow-hidden h-64 md:h-96 w-full relative bg-gray-100"
            >
              <img
                src={recipe.dish.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </FadeIn>
          )}

          <FadeIn delay={0.3}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
            {recipe.dish?.description && (
              <p className="text-gray-600 text-lg mb-6">{recipe.dish.description}</p>
            )}
          </FadeIn>

          <FadeIn delay={0.4} className="flex flex-wrap gap-4 mb-8 text-sm text-gray-600">
            {recipe.dish?.cuisine && (
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                {recipe.dish.cuisine.name}
              </div>
            )}
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              Yield: {recipe.yieldQuantity} {recipe.yieldUnit}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              Labor Cost: ${Number(recipe.laborCost).toFixed(2)}
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.5} direction="left">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
              {recipe.items && recipe.items.length > 0 ? (
                <StaggerContainer className="space-y-3">
                  {recipe.items.map((item: any) => (
                    <StaggerItem
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-700">
                        {item.ingredient?.name || item.childRecipe?.name || 'Unknown Item'}
                      </span>
                      <span className="text-gray-500 bg-white px-2 py-1 rounded shadow-sm text-sm">
                        {Number(item.quantity)} {item.ingredient?.unit || ''}
                      </span>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <p className="text-gray-500 italic">No ingredients listed.</p>
              )}
            </FadeIn>

            <FadeIn delay={0.6} direction="right">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
              <StaggerContainer className="space-y-4">
                {recipe.steps &&
                  recipe.steps.map((step, index) => (
                    <StaggerItem key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 mt-1">{step}</p>
                    </StaggerItem>
                  ))}
              </StaggerContainer>
            </FadeIn>
          </div>
        </div>
      </FadeIn>
    </main>
  );
}
