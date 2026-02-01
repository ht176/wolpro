import type { AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
// import { TOKEN_STORAGE_NAME } from '@/constants'
import router from '@/router'
import { nextTick } from 'vue'

interface CustomCancelToken extends CancelToken {
  filter?: string
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  cancelToken?: CustomCancelToken
}

export class ServiceProxyBase {
  protected async transformOptions(options: CustomAxiosRequestConfig) {
    if (options.method !== 'GET') {
      ElLoading.service({ fullscreen: true, background: '#fffc' })
    }
    options.baseURL = import.meta.env.VITE_APP_API_BASE_URL as string
    // const token = sessionStorage.getItem(TOKEN_STORAGE_NAME)
    options.headers = {
      'Content-Type': 'application/json',
      // 'Authorization': token ? `Bearer ${token}` : '',
    }

    if (options.cancelToken) {
      delete options.cancelToken.filter
      if (Object.keys(options.cancelToken).length === 0) {
        options.cancelToken = undefined
      }
    }
    return Promise.resolve(options)
  }

  protected transformResult(_url: string, response: AxiosResponse, processor: (response: AxiosResponse) => Promise<any>): Promise<any> {
    const msg = response.data.message
    if (response.status === 401) {
      ElMessage.error(msg || 'Token无效或已过期')
      router.push({ name: 'Login' })
    }
    else if (response.status > 400) {
      ElMessage.error(msg || response.statusText || '请求出错')
    }
    if (response.config.method !== 'get') {
      setTimeout(() => {
        const loadingInstance = ElLoading.service({ fullscreen: true, background: '#fffc' })
        nextTick(() => {
          loadingInstance.close()
        })
      }, 200)
    }
    console.log('response.data', response.data)

    return processor(response)
  }
}
