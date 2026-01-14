/**
 * HTTP Service - يتجاوز مشاكل CORS في تطبيقات Capacitor/Android
 * 
 * هذا الملف يوفر دالة httpFetch التي تستخدم CapacitorHttp على الموبايل
 * و fetch العادي على الويب
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorHttp, HttpResponse, HttpOptions } from '@capacitor/core';
import { API_BASE_URL } from '../constants';

/**
 * دالة HTTP موحدة تعمل على الويب والموبايل
 * تستخدم CapacitorHttp على Android/iOS لتجاوز CORS
 */
export async function httpFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // إذا كان التطبيق يعمل على الموبايل (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      const httpOptions: HttpOptions = {
        url: url.startsWith('http') ? url : `${API_BASE_URL}${url}`,
        method: (options.method as any) || 'GET',
        headers: options.headers as Record<string, string> || {},
      };

      // معالجة البيانات
      if (options.body) {
        if (options.body instanceof FormData) {
          // تحويل FormData إلى object
          const formDataObj: Record<string, any> = {};
          (options.body as FormData).forEach((value, key) => {
            formDataObj[key] = value;
          });
          httpOptions.data = formDataObj;
        } else if (typeof options.body === 'string') {
          try {
            httpOptions.data = JSON.parse(options.body);
          } catch {
            httpOptions.data = options.body;
          }
        } else {
          httpOptions.data = options.body;
        }
      }

      // إرسال الطلب
      const response: HttpResponse = await CapacitorHttp.request(httpOptions);

      // تحويل الاستجابة إلى Response object متوافق
      return new Response(JSON.stringify(response.data), {
        status: response.status,
        statusText: response.status === 200 ? 'OK' : 'Error',
        headers: new Headers(response.headers),
      });
    } catch (error) {
      console.error('❌ CapacitorHttp Error:', error);
      throw error;
    }
  }

  // على الويب، استخدم fetch العادي
  return fetch(url, options);
}

/**
 * دوال مساعدة للطلبات الشائعة
 */
export const http = {
  get: (url: string, headers?: Record<string, string>) =>
    httpFetch(url, { method: 'GET', headers }),

  post: (url: string, data?: any, headers?: Record<string, string>) =>
    httpFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (url: string, data?: any, headers?: Record<string, string>) =>
    httpFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (url: string, headers?: Record<string, string>) =>
    httpFetch(url, { method: 'DELETE', headers }),
};

export default httpFetch;
