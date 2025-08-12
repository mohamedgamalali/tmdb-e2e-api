import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TmdbConfig } from './tmdb.config';

@Injectable()
export class TmdbClient {
  private readonly logger = new Logger(TmdbClient.name);
  private readonly http: AxiosInstance;
  private readonly RETRY_BACKOFF_MS = 300;
  private readonly MAX_RETRIES = 3;

  constructor(private config: TmdbConfig) {
    
    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeoutMs,
      params: { api_key: this.config.apiKey, language: 'en' },
    });

    this.http.interceptors.response.use(undefined, async (error) => {
      const config = error.config as AxiosRequestConfig & { __retryCount?: number };
      config.__retryCount = (config.__retryCount ?? 0) + 1;
      const status = error.response?.status;
      const shouldRetry = (!status || ![200, 201].includes(status)) && config.__retryCount <= this.MAX_RETRIES;
      if (shouldRetry) {
        const delay = this.RETRY_BACKOFF_MS * config.__retryCount;
        await this.sleep(delay);
        return this.http(config);
      }
      throw error;
    });
  }

  async request<T>(requestOptions: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.http.request<T>(requestOptions);
      return data;
    } catch (e: any) {
      const status = e.response?.status;
      this.logger.warn(`TMDB error ${status ?? 'NET'} for ${requestOptions.url}`);
      throw e;
    }
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}