import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '../hooks/use-toast';

// API 客户端类
class APIClient {
  private axiosInstance: AxiosInstance;
  private currentAccountCredentials: { email: string; globalAPIKey: string } | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // 设置当前账号凭证
  setCredentials(credentials: { email: string; globalAPIKey: string } | null) {
    this.currentAccountCredentials = credentials;
  }

  // 获取当前账号凭证
  getCredentials() {
    return this.currentAccountCredentials;
  }

  // 设置请求和响应拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 自动注入当前账号凭证
        if (this.currentAccountCredentials && this.isCloudflareAPI(config.url)) {
          config.headers = config.headers || {};
          config.headers['X-Auth-Email'] = this.currentAccountCredentials.email;
          config.headers['X-Auth-Key'] = this.currentAccountCredentials.globalAPIKey;
        }

        // 为每个账号生成隔离的缓存 Key
        if (this.currentAccountCredentials) {
          const accountHash = this.generateAccountHash(this.currentAccountCredentials.email);
          config.headers = config.headers || {};
          config.headers['X-Account-Context'] = accountHash;
        }

        // 添加请求时间戳
        config.metadata = { startTime: Date.now() };

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          accountEmail: this.currentAccountCredentials?.email,
          headers: config.headers,
        });

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          duration: `${duration}ms`,
          accountEmail: this.currentAccountCredentials?.email,
        });

        return response;
      },
      (error) => {
        const duration = Date.now() - (error.config?.metadata?.startTime || 0);
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          duration: `${duration}ms`,
          accountEmail: this.currentAccountCredentials?.email,
          error: error.response?.data,
        });

        // 处理常见的 API 错误
        this.handleAPIError(error);

        return Promise.reject(error);
      }
    );
  }

  // 判断是否为 Cloudflare API 请求
  private isCloudflareAPI(url?: string): boolean {
    if (!url) return false;
    return url.includes('cloudflare.com') ||
           url.includes('api.cloudflare.com') ||
           url.startsWith('/api/');
  }

  // 生成账号哈希用于缓存隔离
  private generateAccountHash(email: string): string {
    // 简单的哈希函数，实际项目中可以使用更复杂的算法
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // 处理 API 错误
  private handleAPIError(error: unknown) {
    const status = error && typeof error === 'object' && 'response' in error && 
      error.response && typeof error.response === 'object' && 'status' in error.response 
      ? error.response.status : undefined;
    const data = error && typeof error === 'object' && 'response' in error && 
      error.response && typeof error.response === 'object' && 'data' in error.response 
      ? error.response.data : undefined;

    switch (status) {
      case 401:
        toast({ title: 'Authentication failed. Please check your API credentials.', variant: 'destructive' });
        break;
      case 403:
        toast({ title: 'Access denied. Please check your account permissions.', variant: 'destructive' });
        break;
      case 429:
        toast({ title: 'Rate limit exceeded. Please try again later.', variant: 'destructive' });
        break;
      case 500:
        toast({ title: 'Server error. Please try again later.', variant: 'destructive' });
        break;
      default:
        if (data && typeof data === 'object' && 'errors' in data && Array.isArray(data.errors)) {
          const errorMessage = data.errors.map((err: unknown) => 
            err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Unknown error'
          ).join(', ');
          toast({ title: `API Error: ${errorMessage}`, variant: 'destructive' });
        } else if (data && typeof data === 'object' && 'message' in data) {
          toast({ title: `API Error: ${String(data.message)}`, variant: 'destructive' });
        }
        break;
    }
  }

  // 通用请求方法
  async request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  // GET 请求
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST 请求
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT 请求
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE 请求
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // PATCH 请求
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

// 创建全局 API 客户端实例
export const apiClient = new APIClient();

// 导出类型
export type { AxiosRequestConfig, AxiosResponse };

// 扩展 AxiosRequestConfig 类型以支持 metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}