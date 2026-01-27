
import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../../ingredients/ingredient.entity';
import { NUTRIENT_MAP, translateFoodName } from './usda-translation.constant';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class UsdaService {
  private readonly logger = new Logger(UsdaService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('USDA_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('USDA_API_KEY is not configured. USDA integration will not work.');
    }
  }

  private async clearCache() {
      const store = this.cacheManager.store as any;
      if (store.keys) {
        const keys = await store.keys('ingredients_list*');
        if (keys.length > 0) {
          if (store.mdel) {
            await store.mdel(...keys);
          } else if (store.del) {
            await Promise.all(keys.map((k: string) => store.del(k)));
          }
        }
      }
  }

  async syncIngredients(page: number = 1, limit: number = 3) {
    if (!this.apiKey) {
      throw new HttpException('USDA_API_KEY is missing', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`Starting USDA sync (page: ${page}, limit: ${limit})...`);

    try {
      // 1. Get a list of foods (Search)
      // We search for "foundation" foods as they are basic ingredients
      const searchResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/foods/list`, {
          params: {
            api_key: this.apiKey,
            dataType: 'Foundation',
            pageSize: limit,
            pageNumber: page,
          },
        }),
      );

      const foods = searchResponse.data;
      if (!foods || foods.length === 0) {
        this.logger.log('No foods found from USDA API.');
        return { count: 0, message: 'No foods found' };
      }

      const fdcIds = foods.map((f: any) => f.fdcId);
      this.logger.log(`Found ${fdcIds.length} foods (IDs: ${fdcIds.join(', ')}). Fetching details...`);

      const httpsAgent = new (require('https').Agent)({ rejectUnauthorized: false });

      // 2. Fetch details (Batch)
      const detailsResponse = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/foods`,
          {
            fdcIds: fdcIds,
            format: 'full', // Return full data for accuracy
          },
          {
            params: { api_key: this.apiKey },
            timeout: 30000, // 30 seconds timeout for larger payloads
            httpsAgent: httpsAgent,
          },
        ),
      );

      const foodDetails = detailsResponse.data;
      let syncedCount = 0;

      // 3. Transform and Save
      for (const food of foodDetails) {
        // Detailed mapping for full USDA structure
        const nutrientMap: Record<string, any> = {};
        
        if (food.foodNutrients) {
            food.foodNutrients.forEach((n: any) => {
                 // In 'full' format, nutrient info is nested in 'nutrient' object
                 const nutrientInfo = n.nutrient || {};
                 
                 // We key by nutrient name for readability, but include ID for precision
                 // e.g. "Protein": { amount: 10, unit: "g", id: 1003 }
                 const rawName = nutrientInfo.name || n.name; 
                 // Try to translate keys derived from ID (most accurate) or use raw name
                 const translatedName = NUTRIENT_MAP[nutrientInfo.id] || rawName;

                 if (translatedName) {
                    nutrientMap[translatedName] = {
                        amount: n.amount,
                        unit: nutrientInfo.unitName || n.unitName,
                        nutrientId: nutrientInfo.id,
                        nutrientNumber: nutrientInfo.number // e.g. "203" for Protein
                    };
                 }
            });
        }

        const ingredientData = {
           name: `${translateFoodName(food.description)} (USDA)`,
           originalName: food.description,
           price: 0, 
           unit: 'g', 
           nutrition: nutrientMap,
        };

        const existing = await this.ingredientRepository.findOne({ where: { name: ingredientData.name }});
        
        if (existing) {
            Object.assign(existing, ingredientData);
            await this.ingredientRepository.save(existing);
        } else {
            const newIngredient = this.ingredientRepository.create(ingredientData);
            await this.ingredientRepository.save(newIngredient);
        }
        syncedCount++;
      }

      this.logger.log(`Successfully synced ${syncedCount} ingredients from USDA (Full Format).`);
      await this.clearCache();
      return { count: syncedCount, message: 'Sync successful' };

    } catch (error: any) {
      this.logger.error('Error syncing with USDA API', error.message);
      this.logger.error(`Error details: code=${error.code}, cause=${error.cause}`);
      if (error.response) {
         this.logger.error(`USDA API Response: status=${error.response.status}, data=${JSON.stringify(error.response.data)}`);
      } else {
         this.logger.error('No response received from USDA API');
      }
      throw new HttpException('Failed to sync with USDA', HttpStatus.BAD_GATEWAY);
    }
  }
}
