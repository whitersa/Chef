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
        const token =
          localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const res = response.data;
        // Check if the response follows the unified format { code, data, message }
        if (res && typeof res.code === 'number') {
          if (res.code === 200) {
            return res.data;
          } else {
            // Business logic error (e.g., 400 Bad Request returned as 200 OK with code 400)
            return Promise.reject(new Error(res.message || 'Error'));
          }
        }
        // Fallback for non-unified responses (e.g., 3rd party APIs)
        return res;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('access_token');
          sessionStorage.removeItem('access_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
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

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}
