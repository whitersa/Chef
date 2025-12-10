import { Test, TestingModule } from '@nestjs/testing';
import { DitaRunnerService } from './services/dita-runner.service';
import { DitaGeneratorService } from './services/dita-generator.service';
import * as fs from 'fs';
import { Recipe } from './types/recipe.interface';

// Mock Recipe Interface locally to avoid import issues
const mockRecipe: Recipe = {
  id: 'test-layout-recipe',
  name: 'Test Layout Recipe',
  variantName: 'Standard Variant',
  yieldQuantity: 1,
  yieldUnit: 'Loaf',
  laborCost: 0,
  items: [
    { quantity: 500, ingredient: { id: '1', name: 'Flour', unit: 'g' } },
    { quantity: 300, ingredient: { id: '2', name: 'Water', unit: 'ml' } },
    { quantity: 10, ingredient: { id: '3', name: 'Salt', unit: 'g' } },
    { quantity: 7, ingredient: { id: '4', name: 'Yeast', unit: 'g' } },
  ],
  preProcessing: [
    { type: 'Mix', description: 'Mix dry ingredients' },
    { type: 'Rest', description: 'Let it rest for 30 mins' },
  ],
  steps: [
    'Mix all ingredients together.',
    'Knead the dough for 10 minutes.',
    'Let it rise for 1 hour.',
    'Bake at 200C for 30 minutes.',
  ],
};

describe('Manual Layout Test', () => {
  let service: DitaRunnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DitaRunnerService, DitaGeneratorService],
    }).compile();

    service = module.get<DitaRunnerService>(DitaRunnerService);
  });

  it('should generate PDF with absolute font path', async () => {
    try {
      const pdfPath = await service.publishRecipeToPdf(mockRecipe);
      console.log('PDF Generated at:', pdfPath);
      expect(fs.existsSync(pdfPath)).toBe(true);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, 120000);
});
