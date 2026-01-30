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

interface UsdaFoodDetails {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    amount?: number;
    value?: number;
    name?: string;
    nutrient?: {
      id?: number;
      name?: string;
      unitName?: string;
      number?: string;
    };
  }>;
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

  private static isSyncingStatic = false;
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
  private get syncStatus() {
    return UsdaService.syncStatusStatic;
  }
  private set syncStatus(value: SyncStatus) {
    UsdaService.syncStatusStatic = value;
  }

  private readonly syncStatus$ = new BehaviorSubject<SyncStatus>(UsdaService.syncStatusStatic);
  private readonly SYNC_STATUS_KEY = 'usda_sync_status';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(SyncIssue)
    private readonly syncIssueRepository: Repository<SyncIssue>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly translationService: TranslationService,
  ) {
    this.apiKey = this.configService.get<string>('USDA_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('USDA_API_KEY is not configured. USDA integration will not work.');
    }
  }

  async onModuleInit() {
    // 从 Redis 恢复状态
    try {
      const persistedStatus = await this.cacheManager.get<SyncStatus>(this.SYNC_STATUS_KEY);
      if (persistedStatus) {
        UsdaService.syncStatusStatic = persistedStatus;

        // 如果发现重启前正在同步，自动触发“断点续传”
        if (persistedStatus.isSyncing) {
          this.logger.warn('Detecting interrupted sync task after restart. Resuming...');
          this.runSyncWorker(
            persistedStatus.currentPage || 1,
            persistedStatus.totalSynced || 0,
            true,
          );
        } else {
          this.syncStatus$.next(UsdaService.syncStatusStatic);
        }

        this.logger.log('Restored USDA sync status from Redis cache');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to restore sync status from Redis', errorMessage);
    }
  }

  private async updateStatus(partialStatus: Partial<typeof UsdaService.syncStatusStatic>) {
    UsdaService.syncStatusStatic = { ...UsdaService.syncStatusStatic, ...partialStatus };
    this.syncStatus$.next(UsdaService.syncStatusStatic);
    await this.cacheManager.set(this.SYNC_STATUS_KEY, UsdaService.syncStatusStatic, 0); // 永久存储
  }

  private async addServerLog(message: string, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    if (isError) {
      this.logger.error(message);
    } else {
      this.logger.log(message);
    }

    // 保持最近 50 条日志
    const newLogs = [...(UsdaService.syncStatusStatic.logs || []), logEntry].slice(-50);
    await this.updateStatus({ logs: newLogs });
  }

  /**
   * 自动化收集同步错误：将异常持久化到数据库
   * K8s 环境下本地文件不可靠，存入数据库是最佳实践
   */
  private async recordDetailedError(fdcId: string | number, rawData: unknown, error: unknown) {
    try {
      const errorObj = error as { message?: string };
      const rawDataObj = rawData as { description?: string };
      const issue = this.syncIssueRepository.create({
        fdcId: fdcId.toString(),
        foodDescription: rawDataObj?.description || 'Unknown',
        errorMessage: errorObj?.message || 'Unknown error',
        rawData: rawData,
      });

      await this.syncIssueRepository.save(issue);
      await this.addServerLog(`⚠️ 数据异常已录入数据库 (FDC ID: ${fdcId})`, true);
    } catch (err) {
      this.logger.error('Failed to record detailed error to DB', err);
    }
  }

  /**
   * 获取所有收集到的同步问题，方便 AI 分析
   */
  async getSyncIssues() {
    return this.syncIssueRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * 清空所有 USDA 同步的数据和异常记录
   * 用于调试或重新开始同步
   */
  async resetSyncData() {
    if (UsdaService.isSyncingStatic) {
      throw new Error('正在同步中，请先停止同步后再重置数据。');
    }

    this.logger.warn('Resetting USDA sync data...');

    // 1. 删除所有标记为 USDA 的食材
    // 逻辑升级：删除 fdcId 不为空的，或者名字里包含 (USDA) 后缀的（清理早期未标记 fdcId 的重复数据）
    const deleteResult = await this.ingredientRepository
      .createQueryBuilder()
      .delete()
      .where('fdcId IS NOT NULL')
      .orWhere('name LIKE :usdaPattern', { usdaPattern: '%(USDA)%' })
      .execute();

    this.logger.warn(`Reset: Deleted ${deleteResult.affected} USDA ingredients.`);

    // 2. 清空异常记录
    await this.syncIssueRepository.clear();

    // 3. 清除相关缓存，防止前端看到旧数据
    await this.clearIngredientsCache();

    // 4. 重置同步状态
    await this.updateStatus({
      totalSynced: 0,
      currentPage: 0,
      lastError: null,
      logs: [`[${new Date().toLocaleTimeString()}] ♻️ 同步数据已重置清空`],
    });

    return { message: 'USDA data reset successfully' };
  }

  /**
   * 清理食材列表的 Redis 缓存，确保重置或更新后前端能看到最新数据
   */
  private async clearIngredientsCache() {
    try {
      // 支持 redis-yet 的 keys/mdel 模式
      const store = this.cacheManager.store as unknown as {
        keys?: (pattern: string) => Promise<string[]>;
        mdel?: (...keys: string[]) => Promise<void>;
        del?: (key: string) => Promise<void>;
      };

      if (store.keys) {
        const keys = await store.keys('ingredients_list*');
        if (keys && keys.length > 0) {
          if (store.mdel) {
            await store.mdel(...keys);
          } else if (store.del) {
            await Promise.all(keys.map((k) => store.del!(k)));
          }
          this.logger.log(`Cleared ${keys.length} ingredient list cache keys`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to clear ingredients cache', error);
    }
  }

  getSyncStatus() {
    return UsdaService.syncStatusStatic;
  }

  getSyncStatusObservable() {
    return this.syncStatus$.asObservable();
  }

  async startFullSync() {
    if (this.isSyncing) {
      throw new HttpException('Sync already in progress', HttpStatus.CONFLICT);
    }

    const newStatus = {
      isSyncing: true,
      totalSynced: 0,
      currentPage: 1,
      lastError: null,
      startTime: new Date(),
      logs: [],
    };
    await this.updateStatus(newStatus);
    await this.addServerLog('🚀 初始化全量同步任务...');

    this.runSyncWorker(1, 0);

    return { message: 'Full sync started in background' };
  }

  /**
   * 停止当前正在进行的同步任务
   */
  async stopSync() {
    if (!this.isSyncing) {
      return { message: '没有正在运行的同步任务' };
    }

    this.isSyncing = false;
    await this.updateStatus({ isSyncing: false });
    await this.addServerLog('🛑 收到停止指令，正在尝试停止同步任务...');
    return { message: 'Sync stop command sent' };
  }

  /**
   * 核心同步工作者逻辑（支持断点续传）
   */
  private runSyncWorker(startPage: number, startCount: number, isResuming = false) {
    this.isSyncing = true;

    // 立即广播状态
    this.syncStatus$.next(UsdaService.syncStatusStatic);

    void (async () => {
      try {
        if (isResuming) {
          await this.addServerLog(`🔄 检测到未完成的任务，正在从第 ${startPage} 页恢复同步...`);
        }

        let currentPage = startPage;
        let totalSynced = startCount;
        let retryCount = 0;
        const maxRetriesPerPage = 3;
        const failedPages: number[] = []; // 记录抓取失败的页码，用于最后重试
        const limit = 25;

        // 第一阶段：主循环同步
        while (true) {
          // 每次循环开始前，检查是否被外部停止
          if (!this.isSyncing) {
            await this.addServerLog('✅ 同步任务已成功停止。');
            break;
          }

          await this.updateStatus({ currentPage, isSyncing: true });
          await this.addServerLog(`📡 正在抓取第 ${currentPage} 页数据...`);

          try {
            const result = await this.syncIngredients(currentPage, limit);

            if (!result.count || result.count === 0) {
              await this.addServerLog('🏁 已到达 USDA 数据末尾，第一阶段主循环完成。');
              break;
            }

            totalSynced += result.count;
            retryCount = 0; // 成功后重置重试计数
            await this.updateStatus({ totalSynced });
            await this.addServerLog(`✅ 本页成功导入 ${result.count} 条数据 (累计 ${totalSynced})`);
            currentPage++;
          } catch (pageErr: unknown) {
            retryCount++;
            const errorObj = pageErr as {
              response?: { status?: number; data?: { error?: { message?: string } } };
              message?: string;
            };
            const isRateLimit = errorObj.response?.status === 429;
            const errorMsg =
              errorObj.response?.data?.error?.message || errorObj.message || '未知错误';

            await this.updateStatus({ lastError: `第 ${currentPage} 页错误: ${errorMsg}` });

            if (isRateLimit) {
              await this.addServerLog(
                `⏳ 触发 USDA 限流 (429): 需等待较长时间。1分钟后重试...`,
                true,
              );
              await new Promise((resolve) => setTimeout(resolve, 60000));
              continue;
            }

            if (retryCount >= maxRetriesPerPage) {
              await this.addServerLog(
                `❌ 第 ${currentPage} 页连续失败 ${maxRetriesPerPage} 次。记录到重试列表，先跳过此页继续。`,
                true,
              );
              failedPages.push(currentPage); // 存入重试队列
              currentPage++;
              retryCount = 0;
              continue;
            }

            await this.addServerLog(
              `⚠️ 第 ${currentPage} 页失败: ${errorMsg}，15秒后进行第 ${retryCount} 次重试...`,
              true,
            );
            await new Promise((resolve) => setTimeout(resolve, 15000));
            continue;
          }

          // 频率控制
          await new Promise((resolve) => setTimeout(resolve, 10000));
          if (currentPage > 300) {
            // 提高到 300 页，适应更多数据
            await this.addServerLog('🛑 达到安全页数上限 (300页)，第一阶段完成。');
            break;
          }
        }

        // 第二阶段：重试失败的页码
        if (failedPages.length > 0 && this.isSyncing) {
          await this.addServerLog(
            `🔄 第二阶段：开始重新尝试此前失败的 ${failedPages.length} 页数据 (${failedPages.join(', ')})...`,
          );

          for (const page of failedPages) {
            if (!this.isSyncing) break;

            await this.addServerLog(`📡 再次尝试抓取第 ${page} 页...`);
            try {
              // 重试时可以增加延时或减少并发考虑
              await new Promise((resolve) => setTimeout(resolve, 20000));
              const result = await this.syncIngredients(page, limit);
              if (result.count > 0) {
                totalSynced += result.count;
                await this.updateStatus({ totalSynced });
                await this.addServerLog(`✅ 重试抓取第 ${page} 页成功！导入 ${result.count} 条。`);
              }
            } catch (retryErr: unknown) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : String(retryErr);
              await this.addServerLog(`❌ 最终放弃第 ${page} 页: 仍然失败 (${errorMessage})`, true);
            }
          }
        }

        this.isSyncing = false;
        await this.updateStatus({ isSyncing: false });
        await this.addServerLog(`🏁 全量同步工作执行完毕，共导入/更新 ${totalSynced} 条食材。`);
      } catch (err: unknown) {
        this.isSyncing = false;
        const finalError = err instanceof Error ? err.message : '关键性服务异常';
        await this.updateStatus({ isSyncing: false, lastError: finalError });
        await this.addServerLog(`💥 同步任务由于关键错误异常终止: ${finalError}`, true);
      }
    })();
  }

  async syncIngredients(page: number = 1, limit: number = 3) {
    if (!this.apiKey) {
      throw new HttpException('USDA_API_KEY is missing', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`Starting USDA sync (page: ${page}, limit: ${limit})...`);

    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const httpsAgent = httpsProxy
      ? new HttpsProxyAgent(httpsProxy)
      : new https.Agent({ rejectUnauthorized: false });

    // 验证代理是否生效
    if (httpsProxy) {
      try {
        const testRes = await firstValueFrom(
          this.httpService.get('https://api.ipify.org?format=json', {
            httpsAgent,
            proxy: false,
            timeout: 5000,
          }),
        );
        const outboundIp = (testRes.data as { ip: string }).ip;
        await this.addServerLog(
          `🔎 代理验证成功: 正在通过代理 [${httpsProxy}] 访问, 出口 IP: ${outboundIp}`,
        );
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        await this.addServerLog(`⚠️ 代理验证失败: 无法通过代理访问网络 (${errorMessage})`, true);
      }
    } else {
      await this.addServerLog('ℹ️ 未检测到环境变量中的代理配置，将尝试直连。');
    }

    try {
      // 1. Get a list of foods (Search)
      // We search for "foundation" foods as they are basic ingredients
      const searchResponse = await firstValueFrom(
        this.httpService.get<UsdaFoodListItem[]>(`${this.baseUrl}/foods/list`, {
          params: {
            api_key: this.apiKey,
            dataType: 'Foundation',
            pageSize: limit,
            pageNumber: page,
          },
          httpsAgent,
          proxy: false, // 强制禁用 Axios 自带的代理逻辑，完全交给 httpsAgent 处理
        }),
      );

      const foods = searchResponse.data;
      if (!foods || !Array.isArray(foods) || foods.length === 0) {
        this.logger.log('No foods found from USDA API or invalid response format.');
        await this.addServerLog('未发现 USDA 数据或返回格式无效。');
        return { count: 0, message: 'No foods found' };
      }

      const fdcIds = foods.map((f) => f.fdcId);
      this.logger.log(
        `Found ${fdcIds.length} foods (IDs: ${fdcIds.join(', ')}). Fetching details...`,
      );

      // 2. Fetch details (Batch)
      const detailsResponse = await firstValueFrom(
        this.httpService.post<UsdaFoodDetails[]>(
          `${this.baseUrl}/foods`,
          {
            fdcIds: fdcIds,
            format: 'full', // Return full data for accuracy
          },
          {
            params: { api_key: this.apiKey },
            timeout: 120000, // Increase to 2 minutes for larger Foundation food payloads
            httpsAgent: httpsAgent,
            proxy: false, // 强制禁用 Axios 自带的代理逻辑
          },
        ),
      );

      const foodDetails = detailsResponse.data;

      // 鲁棒性检查：确保返回的是数组
      if (!Array.isArray(foodDetails)) {
        this.logger.error(
          `USDA Detail API returned non-array response: ${JSON.stringify(foodDetails)}`,
        );
        throw new Error('USDA 详情接口返回格式异常，预期为数组。');
      }

      let syncedCount = 0;

      // 3. Transform and Save
      for (const food of foodDetails) {
        try {
          // Detailed mapping for full USDA structure
          const nutrientMap: Record<string, NutrientData> = {};

          if (food.foodNutrients) {
            food.foodNutrients.forEach((n) => {
              // In 'full' format, nutrient info is nested in 'nutrient' object
              const nutrientInfo = n.nutrient || {};
              const amount = n.amount ?? n.value;

              // Skip if no amount is present (sometimes categories are listed without values)
              if (amount === undefined || amount === null) {
                return;
              }

              const rawName = nutrientInfo.name || n.name || 'Unknown';
              const translatedName =
                (nutrientInfo.id ? NUTRIENT_MAP[nutrientInfo.id] : undefined) || rawName;

              if (translatedName) {
                nutrientMap[translatedName] = {
                  amount,
                  unit: nutrientInfo.unitName || 'g',
                  nutrientId: nutrientInfo.id,
                  nutrientNumber: nutrientInfo.number,
                };
              }
            });
          }

          let translatedName = await this.translationService.translate(food.description);

          // 增强翻译：如果远程翻译失败（返回原文）或未配置，回退到本地词汇映射
          if (translatedName === food.description) {
            translatedName = translateFoodName(food.description);
          }

          const ingredientData = {
            fdcId: food.fdcId.toString(),
            name: `${translatedName} (USDA)`,
            originalName: food.description,
            price: 0,
            unit: '100g', // USDA 营养数据通常基于 100g
            nutrition: nutrientMap,
          };

          // 优先使用 fdcId 进行唯一性检查，避免同名不同 ID 的数据重复
          const existing = await this.ingredientRepository.findOne({
            where: [{ fdcId: ingredientData.fdcId }, { name: ingredientData.name }],
          });

          if (existing) {
            Object.assign(existing, ingredientData);
            await this.ingredientRepository.save(existing);
          } else {
            const newIngredient = this.ingredientRepository.create(ingredientData);
            await this.ingredientRepository.save(newIngredient);
          }
          syncedCount++;
        } catch (itemError: any) {
          // 保存具体导致失败的那个食物的 ID 和原始数据
          await this.recordDetailedError(food.fdcId, food, itemError);
          // 继续处理下一个，不让单个失败拖死整批同步任务
          continue;
        }
      }

      this.logger.log(`Successfully synced ${syncedCount} ingredients from USDA (Full Format).`);
      await this.clearIngredientsCache();
      return { count: syncedCount, message: 'Sync successful' };
    } catch (error: unknown) {
      const err = error as {
        message: string;
        code?: string;
        response?: { status: number; data: { error?: { message?: string } } };
      };
      const status = err.response?.status;
      const errorData = err.response?.data;

      this.logger.error(
        `USDA sync error (Status: ${status}):`,
        JSON.stringify(errorData || err.message),
      );

      let displayMessage = err.message;
      if (status === 400) {
        displayMessage = `请求无效(400): 请检查参数或API Key。错误详情: ${JSON.stringify(errorData)}`;
      }

      await this.addServerLog(`USDA服务异常: ${displayMessage}`, true);

      const errorMessage =
        err.response?.data?.error?.message || err.message || 'Unknown USDA API Error';
      this.logger.error(`USDA API Error: ${errorMessage}`, err.code);
      throw new HttpException(`USDA服务异常: ${errorMessage}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
