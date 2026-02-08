import type { AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import { nextTick } from 'vue'

interface CustomCancelToken extends CancelToken {
  filter?: string
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  cancelToken?: CustomCancelToken
}

export class ServiceProxyBase {
  protected async transformOptions(options: CustomAxiosRequestConfig) {
    // Only show loading for non-GET requests
    if (options.method && options.method.toUpperCase() !== 'GET') {
      ElLoading.service({ fullscreen: true, background: '#fffc' })
    }

    // Set Base URL if not already absolute (though generated code usually handles this)
    options.baseURL = import.meta.env.VITE_API_URL || ''
    console.log('import.meta.env.VITE_API_URL', import.meta.env.VITE_API_URL)

    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    }

    return Promise.resolve(options)
  }

  protected transformResult(
    _url: string,
    response: AxiosResponse,
    processor: (response: AxiosResponse) => Promise<any>,
  ): Promise<any> {
    if (response.status >= 400) {
      const msg = response.data && response.data.message
      ElMessage.error(msg || response.statusText || '请求出错')
    }

    if (response.config.method && response.config.method.toUpperCase() !== 'GET') {
      setTimeout(() => {
        const loadingInstance = ElLoading.service({
          fullscreen: true,
          background: '#fffc',
        })
        nextTick(() => {
          loadingInstance.close()
        })
      }, 200)
    }

    return processor(response)
  }
}
