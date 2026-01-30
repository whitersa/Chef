import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';

interface AzureTranslateResponse {
  translations: {
    text: string;
    to: string;
  }[];
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly key: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.key = this.configService.get<string>('AZURE_TRANSLATOR_KEY') || '';
    this.region = this.configService.get<string>('AZURE_TRANSLATOR_REGION') || 'eastus';
    this.endpoint =
      this.configService.get<string>('AZURE_TRANSLATOR_ENDPOINT') ||
      'https://api.cognitive.microsofttranslator.com/';
  }

  async translateBatch(
    texts: string[],
    from = 'en',
    to = 'zh-Hans',
    signal?: AbortSignal,
  ): Promise<string[]> {
    if (!this.key || !texts || texts.length === 0) {
      return texts;
    }

    // Filter out empty strings but keep track of indices
    const validTexts = texts.map((t) => t || '');

    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const httpsAgent = httpsProxy ? new HttpsProxyAgent(httpsProxy) : undefined;

    try {
      const response = await axios({
        baseURL: this.endpoint.replace(/\/$/, ''),
        url: '/translate',
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.key.trim(),
          'Ocp-Apim-Subscription-Region': this.region.trim(),
          'Content-type': 'application/json',
          'X-ClientTraceId': randomUUID(),
        },
        params: {
          'api-version': '3.0',
          from,
          to,
        },
        data: validTexts.map((text) => ({ text })),
        httpsAgent,
        proxy: false,
        timeout: 30000,
        signal,
      });

      const data = response.data as AzureTranslateResponse[];
      return data.map((item, index): string => {
        const result = item.translations?.[0]?.text;
        const fallback = validTexts[index] ?? '';
        if (!result) {
          this.logger.warn(`Translation failed for index ${index}: ${fallback}`);
          return fallback;
        }
        return result;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Batch translation failed for ${texts.length} items: ${errorMessage}`);
      return texts; // Fallback to original texts
    }
  }

  async translate(text: string, from = 'en', to = 'zh-Hans'): Promise<string> {
    if (!this.key || !text) {
      return text;
    }

    const results = await this.translateBatch([text], from, to);
    return results[0] ?? text;
  }
}
