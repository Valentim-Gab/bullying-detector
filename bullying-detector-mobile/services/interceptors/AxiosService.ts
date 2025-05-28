import { environment } from '@/environments/environment'
import { router } from 'expo-router'
import { AuthToken } from '@/interfaces/Auth'
import axios, { HttpStatusCode } from 'axios'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import { getGlobalQueryClient } from '@/utils/queryUtil'

const axiosService = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
    console.error('Axios error:', error)

    if (
      error.response &&
      error.response.status === HttpStatusCode.Unauthorized
    ) {
      const assToken = await SecureStore.getItemAsync('access_token')
      const refToken = await SecureStore.getItemAsync('refresh_token')
      const stayConnected = true // await SecureStore.getItemAsync('stay_connected')

      if (assToken && refToken && stayConnected) {
        try {
          const res = await fetch(`${environment.apiUrl}/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${assToken}`,
            },
            body: JSON.stringify({ refreshToken: refToken }),
          })

          if (!res || res.status !== HttpStatusCode.Created) {
            expireSession()

            return Promise.reject(error)
          }

          const { tokens }: { tokens: AuthToken } = await res.json()

          await SecureStore.setItemAsync('access_token', tokens.accessToken)
          await SecureStore.setItemAsync('refresh_token', tokens.refreshToken)

          return axiosService.request(error.config)
        } catch (err) {
          expireSession()
          return err
        }
      }
    } else {
      return error
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

  const queryClient = getGlobalQueryClient()
  queryClient.clear()

  router.replace('/login')
}

export default axiosService
