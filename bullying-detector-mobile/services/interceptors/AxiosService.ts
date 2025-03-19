import axios, { HttpStatusCode } from 'axios'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import { environment } from '@/environments/environment'
import { router } from 'expo-router'

const axiosService = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

axiosService.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === HttpStatusCode.Unauthorized
    ) {
      const assToken = await SecureStore.getItemAsync('access_token')
      const refToken = await SecureStore.getItemAsync('refresh_token')
      const stayConnected = true // await SecureStore.getItemAsync('stay_connected')

      if (assToken && refToken && stayConnected) {
        if (!isRefreshing) {
          isRefreshing = true

          try {
            const res = await fetch(`${environment.apiUrl}/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${assToken}`,
              },
              body: JSON.stringify({ refreshToken: refToken }),
            })

            console.log('refresh', res.status)

            if (!res || res.status != HttpStatusCode.Created) {
              expireSession()
              return Promise.reject(error)
            }

            const { tokens: AuthToken } = await res.json()

            console.log('refresh', tokens.accessToken, tokens.refreshToken)

            await SecureStore.setItemAsync('access_token', tokens.accessToken)
            await SecureStore.setItemAsync('refresh_token', tokens.refreshToken)

            isRefreshing = false
            onTokenRefreshed(tokens.accessToken)
          } catch (err) {
            isRefreshing = false
            expireSession()
            return Promise.reject(err)
          }
        }

        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            error.config.headers.Authorization = `Bearer ${token}`
            resolve(axiosService.request(error.config))
          })
        })
      } else {
        expireSession()
      }
    }

    return error
  }
)

const expireSession = () => {
  Toast.show({
    type: 'error',
    text1: 'Sessão expirada!',
    text1Style: { fontSize: 14 },
  })
  SecureStore.deleteItemAsync('access_token')
  SecureStore.deleteItemAsync('refresh_token')
  router.replace('/login')
}

export default axiosService
