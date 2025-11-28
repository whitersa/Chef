import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Recipe } from './recipe.entity';
import { RecipeVersion } from './recipe-version.entity';
import { AuditService } from '../audit/audit.service';
import { DataSource } from 'typeorm';

describe('RecipesService Nutrition', () => {
  let service: RecipesService;

  const mockRepo = {
    findOne: jest.fn(),
  };
  const mockVersionRepo = {};
  const mockAuditService = {};
  const mockDataSource = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        { provide: getRepositoryToken(Recipe), useValue: mockRepo },
        {
          provide: getRepositoryToken(RecipeVersion),
          useValue: mockVersionRepo,
        },
        { provide: AuditService, useValue: mockAuditService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should calculate nutrition correctly with sub-recipes (Batches logic)', async () => {
    // Recipe A (Parent) -> 1 Batch
    //   - Ingredient 1: 100g (Net), Nutrition: 100kcal/100g
    //   - Recipe B (Child): 0.5 Batches

    // Recipe B (Child) -> 1 Batch
    //   - Ingredient 2: 200g (Net), Nutrition: 50kcal/100g

    // Expected B:
    // Weight: 200g
    // Calories: (200g / 100g) * 50 = 100 kcal

    // Expected A:
    // Ing1 Weight: 100g
    // Ing1 Calories: (100g / 100g) * 100 = 100 kcal
    // Child B Weight: 0.5 * 200g = 100g
    // Child B Calories: 0.5 * 100 kcal = 50 kcal

    // Total A:
    // Weight: 200g
    // Calories: 150 kcal

    const recipeA = {
      id: 'A',
      name: 'Parent',
      items: [
        {
          ingredient: {
            id: 'i1',
            name: 'Ing1',
            unit: 'g',
            nutrition: { calories: 100, protein: 0, fat: 0, carbs: 0 },
          },
          quantity: 100,
        },
        {
          childRecipe: { id: 'B', name: 'Child' },
          quantity: 0.5, // 0.5 Batches
        },
      ],
    };

    const recipeB = {
      id: 'B',
      name: 'Child',
      items: [
        {
          ingredient: {
            id: 'i2',
            name: 'Ing2',
            unit: 'g',
            nutrition: { calories: 50, protein: 0, fat: 0, carbs: 0 },
          },
          quantity: 200,
        },
      ],
    };

    mockRepo.findOne.mockImplementation(({ where: { id } }) => {
      if (id === 'A') return Promise.resolve(recipeA);
      if (id === 'B') return Promise.resolve(recipeB);
      return Promise.resolve(null);
    });

    const result = await service.calculateNutrition('A');

    expect(result.totalWeight).toBe(200);
    expect(result.calories).toBe(150);
  });
});
