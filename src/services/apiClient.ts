import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

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
           url.includes('api.cloudflare.com');
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
  private handleAPIError(error: any) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 401:
        message.error('Authentication failed. Please check your API credentials.');
        break;
      case 403:
        message.error('Access denied. Please check your account permissions.');
        break;
      case 429:
        message.error('Rate limit exceeded. Please try again later.');
        break;
      case 500:
        message.error('Server error. Please try again later.');
        break;
      default:
        if (data?.errors && Array.isArray(data.errors)) {
          const errorMessage = data.errors.map((err: any) => err.message).join(', ');
          message.error(`API Error: ${errorMessage}`);
        } else if (data?.message) {
          message.error(`API Error: ${data.message}`);
        }
        break;
    }
  }

  // 权限校验：确保请求使用正确的账号上下文
  private validateAccountContext(config: AxiosRequestConfig): boolean {
    // 对于 Cloudflare API，检查是否有凭证和认证头
    if (this.isCloudflareAPI(config.url)) {
      if (!this.currentAccountCredentials) {
        console.warn('[API Client] No account credentials set for Cloudflare API');
        return false;
      }

      if (!config.headers?.['X-Auth-Email']) {
        console.warn('[API Client] Cloudflare API request without authentication headers');
        return false;
      }
    } else {
      // 对于自定义 API，只检查是否有凭证（凭证会在请求体中传递）
      if (!this.currentAccountCredentials) {
        console.warn('[API Client] No account credentials set for API request');
        return false;
      }
    }

    return true;
  }

  // 通用请求方法
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // 权限校验
    if (!this.validateAccountContext(config)) {
      throw new Error('Invalid account context for API request');
    }

    return this.axiosInstance.request<T>(config);
  }

  // GET 请求
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST 请求
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT 请求
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE 请求
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // PATCH 请求
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
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