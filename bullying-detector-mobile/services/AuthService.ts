import { environment } from '@/environments/environment'
import { LoginData } from '@/interfaces/Auth'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { HttpStatusCode } from 'axios'
import axiosService from './interceptors/AxiosService'

export async function signIn(data: LoginData) {
  const url = environment.apiUrl + '/login'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res) {
    throw new Error()
  }

  if (!res.ok) {
    if (res.status == 401) {
      const error = await res.json()

      throw new Error(error.message)
    }

    throw new Error()
  }

  return await res.json()
}

export async function signOut() {
  SecureStore.deleteItemAsync('access_token')
  SecureStore.deleteItemAsync('refresh_token')
  router.replace('/login')
}

export async function checkAuth(): Promise<boolean> {
  const res = await axiosService.head('/check')

  if (!res || res.status != HttpStatusCode.Ok) {
    return false
  }

  return true
}
