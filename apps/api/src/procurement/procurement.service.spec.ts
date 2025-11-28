import { Test, TestingModule } from '@nestjs/testing';
import { ProcurementService } from './procurement.service';
import { RecipesService } from '../recipes/recipes.service';
import { Decimal } from 'decimal.js';

describe('ProcurementService', () => {
  let service: ProcurementService;
  let module: TestingModule;

  const mockRecipesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ProcurementService,
        {
          provide: RecipesService,
          useValue: mockRecipesService,
        },
      ],
    }).compile();

    service = module.get<ProcurementService>(ProcurementService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a procurement list correctly', async () => {
    // Setup:
    // Recipe A (Parent) -> 2 Batches
    //   - Ingredient 1: 100g, Yield 1.0
    //   - Recipe B (Child): 0.5 Batches
    // Recipe B (Child)
    //   - Ingredient 2: 200g, Yield 0.8

    // Expected:
    // Ingredient 1: 2 * 100g = 200g
    // Recipe B needed: 2 * 0.5 = 1 Batch
    // Ingredient 2: 1 * (200g / 0.8) = 250g

    const recipeA = {
      id: 'A',
      name: 'Parent',
      items: [
        {
          ingredient: { id: 'i1', name: 'Ing1', unit: 'g', price: 10 },
          quantity: 100,
          yieldRate: 1,
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
          ingredient: { id: 'i2', name: 'Ing2', unit: 'g', price: 20 },
          quantity: 200,
          yieldRate: 0.8,
        },
      ],
    };

    mockRecipesService.findOne.mockImplementation((id) => {
      if (id === 'A') return Promise.resolve(recipeA);
      if (id === 'B') return Promise.resolve(recipeB);
      return Promise.resolve(null);
    });

    const result = await service.generateList({
      items: [{ recipeId: 'A', quantity: 2 }], // 2 Batches of A
    });

    expect(result).toHaveLength(2);

    const ing1 = result.find((i) => i.ingredientId === 'i1');
    const ing2 = result.find((i) => i.ingredientId === 'i2');

    expect(ing1).toBeDefined();
    if (ing1) {
      expect(new Decimal(ing1.quantity).toNumber()).toBe(200); // 2 * 100
    }

    expect(ing2).toBeDefined();
    if (ing2) {
      // 2 (A batches) * 0.5 (B per A) = 1 Batch of B
      // 1 * 200 (Ing2 per B) / 0.8 (Yield) = 250
      expect(new Decimal(ing2.quantity).toNumber()).toBe(250);
    }
  });
});
