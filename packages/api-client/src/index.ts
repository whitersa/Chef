import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        // TODO: Get token from storage and add to headers
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response.data;
      },
      (error) => {
        // TODO: Handle 401/403 errors
        return Promise.reject(error);
      },
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}
