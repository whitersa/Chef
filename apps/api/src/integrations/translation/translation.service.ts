import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';

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

  async translate(text: string, from = 'en', to = 'zh-Hans'): Promise<string> {
    if (!this.key || !text) {
      return text;
    }

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
        data: [{ text }],
        httpsAgent,
        proxy: false, // 强制禁用 Axios 自带的代理逻辑
      });

      const translatedText = response.data[0].translations[0].text;
      this.logger.debug(`Translated: "${text}" -> "${translatedText}"`);
      return translatedText;
    } catch (error: any) {
      this.logger.error(`Translation failed for "${text}": ${error.message}`);
      return text; // Fallback to original text
    }
  }
}
