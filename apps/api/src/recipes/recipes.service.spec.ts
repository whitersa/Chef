import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RecipesService } from './recipes.service';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

describe('RecipesService', () => {
  let service: RecipesService;

  const mockRecipeRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    manager: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getRepositoryToken(Recipe),
          useValue: mockRecipeRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for simple ingredients', async () => {
      // Arrange
      const ingredient = {
        id: 'ing-1',
        name: 'Tomato',
        price: 5.0, // 5.0 per unit
        unit: 'kg',
      } as Ingredient;

      const recipeItem = {
        id: 'item-1',
        quantity: 2, // 2 units
        yieldRate: 1,
        ingredient: ingredient,
      } as RecipeItem;

      const recipe = {
        id: 'recipe-1',
        name: 'Tomato Soup',
        items: [recipeItem],
      } as Recipe;

      mockRecipeRepository.findOne.mockResolvedValue(recipe);

      // Act
      const cost = await service.calculateCost('recipe-1');

      // Assert
      // 5.0 * 2 = 10.0
      expect(cost).toBe(10.0);
    });

    it('should handle yield rate correctly', async () => {
      // Arrange
      const ingredient = {
        id: 'ing-1',
        name: 'Potato',
        price: 3.0,
        unit: 'kg',
      } as Ingredient;

      const recipeItem = {
        id: 'item-1',
        quantity: 1,
        yieldRate: 0.8, // 20% loss
        ingredient: ingredient,
      } as RecipeItem;

      const recipe = {
        id: 'recipe-1',
        name: 'Mashed Potato',
        items: [recipeItem],
      } as Recipe;

      mockRecipeRepository.findOne.mockResolvedValue(recipe);

      // Act
      const cost = await service.calculateCost('recipe-1');

      // Assert
      // (3.0 * 1) / 0.8 = 3.75
      expect(cost).toBe(3.75);
    });

    it('should calculate cost recursively for sub-recipes', async () => {
      // Arrange
      // Sub-recipe: Tomato Sauce (Cost = 10)
      const subRecipe = {
        id: 'sub-1',
        name: 'Tomato Sauce',
        items: [
          {
            quantity: 2,
            yieldRate: 1,
            ingredient: { price: 5.0 },
          },
        ],
      } as unknown as Recipe;

      // Main recipe uses 0.5 of Sub-recipe
      const mainRecipe = {
        id: 'main-1',
        name: 'Pasta',
        items: [
          {
            quantity: 0.5,
            yieldRate: 1,
            childRecipe: { id: 'sub-1' },
          },
        ],
      } as unknown as Recipe;

      mockRecipeRepository.findOne.mockImplementation((options: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.id === 'main-1') return Promise.resolve(mainRecipe);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.id === 'sub-1') return Promise.resolve(subRecipe);
        return Promise.resolve(null);
      });

      // Act
      const cost = await service.calculateCost('main-1');

      // Assert
      // Sub-recipe cost = 5 * 2 = 10
      // Main recipe cost = 10 * 0.5 = 5
      expect(cost).toBe(5.0);
    });

    it('should detect circular dependencies', async () => {
      // Arrange
      const recipeA = {
        id: 'A',
        items: [{ childRecipe: { id: 'B' }, quantity: 1, yieldRate: 1 }],
      } as unknown as Recipe;

      const recipeB = {
        id: 'B',
        items: [{ childRecipe: { id: 'A' }, quantity: 1, yieldRate: 1 }],
      } as unknown as Recipe;

      mockRecipeRepository.findOne.mockImplementation((options: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.id === 'A') return Promise.resolve(recipeA);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.id === 'B') return Promise.resolve(recipeB);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(service.calculateCost('A')).rejects.toThrow(
        'Circular dependency detected',
      );
    });

    it('should throw error if yield rate is zero', async () => {
      const recipe = {
        id: 'recipe-1',
        name: 'Bad Recipe',
        items: [
          {
            quantity: 1,
            yieldRate: 0,
            ingredient: { price: 10 },
          },
        ],
      } as unknown as Recipe;

      mockRecipeRepository.findOne.mockResolvedValue(recipe);

      await expect(service.calculateCost('recipe-1')).rejects.toThrow(
        'Yield rate cannot be zero',
      );
    });
  });
});
