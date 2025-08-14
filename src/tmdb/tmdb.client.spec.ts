import { Test } from '@nestjs/testing';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from '@nestjs/common';
import { TmdbClient } from './tmdb.client';
import { TmdbConfig } from './tmdb.config';

jest.mock('axios');

type FakeAxios = {
  request: jest.Mock;
  interceptors: { response: { use: jest.Mock } };
};

describe('TmdbClient', () => {
  let client: TmdbClient;
  let fakeAxios: FakeAxios;
  let onErrorInterceptor: (error: any) => any;

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  const config: Partial<TmdbConfig> = {
    baseUrl: 'https://api.themoviedb.org/3',
    timeoutMs: 8000,
    apiKey: 'TEST_KEY',
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    onErrorInterceptor = undefined as unknown as any;
    fakeAxios = {
      request: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn((onFulfilled, onRejected) => {
            onErrorInterceptor = onRejected!;
            return 0;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(fakeAxios as unknown as AxiosInstance);

    const moduleRef = await Test.createTestingModule({
      providers: [
        TmdbClient,
        { provide: TmdbConfig, useValue: config },
      ],
    }).compile();

    client = moduleRef.get(TmdbClient);

    expect(fakeAxios.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockAxiosRes(outcomes: Array<{ ok?: any; status?: number; netErr?: boolean }>) {
    fakeAxios.request.mockImplementation(async (cfg: AxiosRequestConfig & { __retryCount?: number }) => {
      const next = outcomes.shift();
      if (!next) return { data: undefined };

      if (next.ok !== undefined) {
        return { data: next.ok };
      }

      const error: any = { config: cfg };
      if (!next.netErr) {
        error.response = { status: next.status ?? 500 };
      }
      return onErrorInterceptor(error);
    });
  }

  it('returns data on first success without retries', async () => {
    const data = { hello: 'world' };
    mockAxiosRes([{ ok: data, status: 200 }]);

    const res = await client.request<{ hello: string }>({ url: '/movie/popular', method: 'GET', params: { page: 1 } });

    expect(res).toEqual(data);
    expect(fakeAxios.request).toHaveBeenCalledTimes(1);
    expect(fakeAxios.request).toHaveBeenCalledWith(expect.objectContaining({ url: '/movie/popular', method: 'GET' }));
  });
});
