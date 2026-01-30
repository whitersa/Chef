import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../../ingredients/ingredient.entity';
import { SyncIssue } from './sync-issue.entity';
import { NUTRIENT_MAP, translateFoodName } from './usda-translation.constant';
import { TranslationService } from '../translation/translation.service';
import { Category } from '../../categories/category.entity';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface UsdaFoodListItem {
  fdcId: number;
  description: string;
}

interface NutrientData {
  amount: number;
  unit: string;
  nutrientId?: number;
  nutrientNumber?: string;
}

interface UsdaFoodNutrient {
  amount?: number;
  value?: number;
  name?: string;
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  nutrient?: {
    id?: number;
    name?: string;
    unitName?: string;
    number?: string;
  };
}

interface UsdaFoodDetails {
  fdcId: number;
  description: string;
  foodCategory?: {
    id: number;
    name: string;
    code?: string;
  };
  foodNutrients: UsdaFoodNutrient[];
}

interface SyncStatus {
  isSyncing: boolean;
  totalSynced: number;
  currentPage: number;
  lastError: string | null;
  startTime: Date | null;
  logs: string[];
}

@Injectable()
export class UsdaService {
  private readonly logger = new Logger(UsdaService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  private adaptiveBatchSize = 10;
  private static readonly MAX_BATCH_SIZE = 50;
  private static readonly MIN_BATCH_SIZE = 2;
  private static isSyncingStatic = false;
  private static abortController: AbortController | null = null;
  private static syncStatusStatic: SyncStatus = {
    isSyncing: false,
    totalSynced: 0,
    currentPage: 0,
    lastError: null,
    startTime: null,
    logs: [],
  };

  private get isSyncing() {
    return UsdaService.isSyncingStatic;
  }
  private set isSyncing(value: boolean) {
    UsdaService.isSyncingStatic = value;
  }

  private readonly syncStatus$ = new BehaviorSubject<SyncStatus>(UsdaService.syncStatusStatic);
  private readonly SYNC_STATUS_KEY = 'usda_sync_status';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SyncIssue)
    private readonly syncIssueRepository: Repository<SyncIssue>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly translationService: TranslationService,
  ) {
    this.apiKey = this.configService.get<string>('USDA_API_KEY') || '';
  }

  async onModuleInit() {
    try {
      const persistedStatus = await this.cacheManager.get<SyncStatus>(this.SYNC_STATUS_KEY);
      if (persistedStatus) {
        UsdaService.syncStatusStatic = persistedStatus;
        if (persistedStatus.isSyncing) {
          this.logger.warn('Resuming interrupted sync...');
          this.isSyncing = true;
          this.runSyncWorker();
        } else {
          this.syncStatus$.next(UsdaService.syncStatusStatic);
        }
      }
    } catch (err) {
      this.logger.error('Failed to restore status', err);
    }
  }

  getSyncStatus() {
    return this.syncStatus$.asObservable();
  }

  getStatusInstant() {
    return UsdaService.syncStatusStatic;
  }

  async startSync() {
    if (this.isSyncing) {
      throw new HttpException('Sync already in progress', HttpStatus.CONFLICT);
    }

    this.updateStatus({
      isSyncing: true,
      totalSynced: 0,
      currentPage: 1,
      lastError: null,
      startTime: new Date(),
      logs: [],
    });

    await this.addServerLog('🚀 Starting USDA adaptive sync (Discovery + Ingestion)...');
    this.runSyncWorker();
    return { message: 'Sync started' };
  }

  async stopSync() {
    if (!this.isSyncing) {
      return { message: 'No sync running' };
    }
    this.isSyncing = false;
    if (UsdaService.abortController) {
      UsdaService.abortController.abort();
    }
    await this.addServerLog('🛑 Sync stop requested by user.');
    return { message: 'Sync stopping' };
  }

  private runSyncWorker() {
    this.isSyncing = true;
    UsdaService.abortController = new AbortController();
    const signal = UsdaService.abortController.signal;
    this.syncStatus$.next(UsdaService.syncStatusStatic);

    void (async () => {
      const overallStartTime = Date.now();
      try {
        await this.addServerLog('🔍 Phase 1: Scanning USDA database for IDs...');
        const allFdcIds: number[] = [];
        let discoPage = 1;
        const discoLimit = 50;

        const discoveryStartTime = Date.now();
        while (true) {
          if (!this.isSyncing || signal.aborted) break;
          try {
            const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
            const httpsAgent = httpsProxy
              ? new HttpsProxyAgent(httpsProxy)
              : new https.Agent({ rejectUnauthorized: false });

            const res = await firstValueFrom(
              this.httpService.get<UsdaFoodListItem[]>(`${this.baseUrl}/foods/list`, {
                params: {
                  api_key: this.apiKey,
                  dataType: 'Foundation',
                  pageSize: discoLimit,
                  pageNumber: discoPage,
                },
                httpsAgent,
                proxy: false,
                signal,
              }),
            );
            const pageIds = (res.data || []).map((f) => f.fdcId);
            if (pageIds.length === 0) break;
            allFdcIds.push(...pageIds);
            discoPage++;
            if (discoPage % 5 === 0)
              await this.addServerLog(`📡 Scanned ${allFdcIds.length} IDs...`);
          } catch {
            await this.addServerLog(
              `⚠️ Error scanning IDs on page ${discoPage}. Proceeding with found IDs.`,
            );
            break;
          }
        }

        if (allFdcIds.length === 0) {
          await this.addServerLog('🏁 No data found.');
          this.isSyncing = false;
          this.updateStatus({ isSyncing: false });
          return;
        }

        const discoveryDuration = Date.now() - discoveryStartTime;
        await this.addServerLog(
          `✅ Discovery complete: ${allFdcIds.length} items found in ${(discoveryDuration / 1000).toFixed(1)}s. Starting adaptive ingestion...`,
        );
        let currentIndex = 0;
        let totalSynced = 0;
        const totalToProcess = allFdcIds.length;

        while (currentIndex < totalToProcess) {
          if (!this.isSyncing || signal.aborted) break;
          const currentBatchSize = this.adaptiveBatchSize;
          const batchIds = allFdcIds.slice(currentIndex, currentIndex + currentBatchSize);
          this.updateStatus({
            currentPage: Math.floor(currentIndex / currentBatchSize) + 1,
            totalSynced,
          });

          const startTime = Date.now();
          try {
            const result = await this.syncIngredientsBatch(batchIds);
            const duration = Date.now() - startTime;
            totalSynced += result.count;
            currentIndex += batchIds.length;

            await this.addServerLog(
              `📦 Batch processed: ${result.count} items in ${(duration / 1000).toFixed(1)}s (Size: ${currentBatchSize})`,
            );

            if (duration > 35000) {
              this.adaptiveBatchSize = Math.max(
                UsdaService.MIN_BATCH_SIZE,
                Math.floor(this.adaptiveBatchSize * 0.6),
              );
              await this.addServerLog(
                `🐢 Latency high (${(duration / 1000).toFixed(1)}s), batch size reduced to ${this.adaptiveBatchSize}`,
              );
            } else if (duration < 15000 && this.adaptiveBatchSize < UsdaService.MAX_BATCH_SIZE) {
              this.adaptiveBatchSize = Math.min(
                UsdaService.MAX_BATCH_SIZE,
                this.adaptiveBatchSize + 2,
              );
              await this.addServerLog(
                `🚀 Latency low (${(duration / 1000).toFixed(1)}s), batch size increased to ${this.adaptiveBatchSize}`,
              );
            }
            this.updateStatus({ totalSynced });
          } catch (err) {
            await this.addServerLog(
              `❌ Batch failed: ${err instanceof Error ? err.message : 'Unknown'}, skipping.`,
              true,
            );
            currentIndex += batchIds.length;
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        this.isSyncing = false;
        this.updateStatus({ isSyncing: false });
        const totalDuration = Date.now() - overallStartTime;
        await this.addServerLog(
          `🏁 Sync complete. Processed ${totalSynced} / ${totalToProcess} ingredients. Total time: ${(totalDuration / 60000).toFixed(1)}m`,
        );
      } catch (err) {
        this.isSyncing = false;
        const msg = err instanceof Error ? err.message : 'Worker crash';
        this.updateStatus({ isSyncing: false, lastError: msg });
        await this.addServerLog(`💥 Sync terminated: ${msg}`, true);
      }
    })();
  }

  private async syncIngredientsBatch(fdcIds: number[]) {
    if (fdcIds.length === 0) return { count: 0 };
    const signal = UsdaService.abortController?.signal;
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const httpsAgent = httpsProxy
      ? new HttpsProxyAgent(httpsProxy)
      : new https.Agent({ rejectUnauthorized: false });

    try {
      const res = await firstValueFrom(
        this.httpService.post<UsdaFoodDetails[]>(
          `${this.baseUrl}/foods`,
          { fdcIds, format: 'abridged' },
          {
            params: { api_key: this.apiKey },
            timeout: 60000,
            httpsAgent,
            proxy: false,
            signal,
          },
        ),
      );
      if (!Array.isArray(res.data)) return { count: 0 };
      return this.processAndSaveIngredients(res.data, signal);
    } catch (err) {
      throw new Error(
        `Batch detail fetch failed: ${err instanceof Error ? err.message : 'Network error'}`,
      );
    }
  }

  private async processAndSaveIngredients(foodDetails: UsdaFoodDetails[], signal?: AbortSignal) {
    const descriptions = foodDetails.map((f) => f.description);
    const categoryNames = [
      ...new Set(foodDetails.map((f) => f.foodCategory?.name).filter((n): n is string => !!n)),
    ];
    const allTexts = [...descriptions, ...categoryNames];
    const translationMap = new Map<string, string>();

    if (allTexts.length > 0) {
      await this.addServerLog(`🌐 Batch translation in progress for ${allTexts.length} strings...`);
      try {
        const results = await this.translationService.translateBatch(
          allTexts,
          'en',
          'zh-Hans',
          signal,
        );
        allTexts.forEach((text, i) => translationMap.set(text, results[i] || text));
      } catch {
        this.logger.warn('Translation failed');
      }
    }

    let synced = 0;
    for (const food of foodDetails) {
      if (signal?.aborted) break;
      try {
        const nutrientMap: Record<string, NutrientData> = {};
        food.foodNutrients?.forEach((n) => {
          const amount = n.amount ?? n.value;
          if (amount == null) return;
          const id = n.nutrient?.id || n.nutrientId;
          const name = n.nutrient?.name || n.nutrientName || n.name || 'Unknown';
          const unit = n.nutrient?.unitName || n.unitName || 'g';
          const mapped = (id ? NUTRIENT_MAP[id] : undefined) || name;
          nutrientMap[mapped] = {
            amount,
            unit,
            nutrientId: id,
            nutrientNumber: n.nutrient?.number || n.nutrientNumber,
          };
        });

        const desc = food.description || 'Unknown';
        let name = translationMap.get(desc) || desc;
        if (name === desc) name = translateFoodName(desc);

        let categoryId: string | undefined;
        if (food.foodCategory?.name) {
          const cName = food.foodCategory.name;
          let cat = await this.categoryRepository.findOne({ where: { originalName: cName } });
          if (!cat) {
            cat = await this.categoryRepository.save(
              this.categoryRepository.create({
                name: translationMap.get(cName) || cName,
                originalName: cName,
              }),
            );
          }
          categoryId = cat.id;
        }

        const data = {
          fdcId: food.fdcId.toString(),
          name: `${name} (USDA)`,
          originalName: desc,
          nutrition: nutrientMap,
          categoryId,
          unit: '100g',
          price: 0,
        };

        let existing = await this.ingredientRepository.findOne({ where: { fdcId: data.fdcId } });
        if (!existing) {
          existing = await this.ingredientRepository.findOne({ where: { name: data.name } });
          if (existing && existing.fdcId && existing.fdcId !== data.fdcId) {
            data.name = `${name} #${food.fdcId} (USDA)`;
            existing = null;
          }
        }

        if (existing) {
          Object.assign(existing, data);
          await this.ingredientRepository.save(existing);
        } else {
          await this.ingredientRepository.save(this.ingredientRepository.create(data));
        }
        synced++;
      } catch (err) {
        await this.recordDetailedError(food.fdcId, food, err);
      }
    }
    return { count: synced };
  }

  async syncIngredient(fdcId: number) {
    const signal = UsdaService.abortController?.signal;
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const httpsAgent = httpsProxy
      ? new HttpsProxyAgent(httpsProxy)
      : new https.Agent({ rejectUnauthorized: false });

    try {
      const res = await firstValueFrom(
        this.httpService.get<UsdaFoodDetails>(`${this.baseUrl}/food/${fdcId}`, {
          params: { api_key: this.apiKey, format: 'abridged' },
          httpsAgent,
          proxy: false,
          signal,
        }),
      );
      if (!res.data) throw new Error('Not found');
      const result = await this.processAndSaveIngredients([res.data], signal);
      return result.count > 0;
    } catch {
      throw new HttpException('Sync failed', HttpStatus.BAD_GATEWAY);
    }
  }

  async getSyncIssues() {
    return this.syncIssueRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async resetSyncData() {
    if (this.isSyncing) {
      throw new HttpException('Cannot reset while syncing', HttpStatus.CONFLICT);
    }
    // Delete only ingredients that came from USDA (have fdcId)
    await this.ingredientRepository
      .createQueryBuilder()
      .delete()
      .where('fdcId IS NOT NULL')
      .execute();

    // Clear all sync issues
    await this.syncIssueRepository.clear();

    this.updateStatus({
      totalSynced: 0,
      currentPage: 0,
      lastError: null,
      logs: [`[${new Date().toLocaleTimeString()}] ♻️ All USDA sync data has been reset.`],
    });

    return { message: 'Data reset successfully' };
  }

  private updateStatus(status: Partial<SyncStatus>) {
    UsdaService.syncStatusStatic = { ...UsdaService.syncStatusStatic, ...status };
    this.syncStatus$.next(UsdaService.syncStatusStatic);
    void this.cacheManager.set(this.SYNC_STATUS_KEY, UsdaService.syncStatusStatic, 0);
  }

  private async addServerLog(message: string, isError = false) {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    if (isError) {
      this.logger.error(message);
    } else {
      this.logger.log(message);
    }
    UsdaService.syncStatusStatic.logs = [entry, ...(UsdaService.syncStatusStatic.logs || [])].slice(
      0,
      100,
    );
    this.syncStatus$.next(UsdaService.syncStatusStatic);
    await Promise.resolve();
  }

  private async recordDetailedError(fdcId: number, data: UsdaFoodDetails, error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    await this.addServerLog(`❌ FDC ID ${fdcId} failed: ${msg}`, true);
    try {
      await this.syncIssueRepository.save(
        this.syncIssueRepository.create({
          fdcId: fdcId.toString(),
          foodDescription: data?.description,
          errorMessage: msg,
          rawData: data as any,
        }),
      );
    } catch {
      // Ignore DB logging errors during sync
    }
  }

  private async clearIngredientsCache() {}
}
