import { useState, useEffect } from 'react'
import { checkAuth } from '@/services/AuthService'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  const checkAuthentication = async () => {
    const hasToken = await SecureStore.getItemAsync('access_token')

    if (!hasToken) {
      setIsAuthenticated(false)
      router.replace('/login')

      return
    }

    const isAuth = await checkAuth()
    setIsAuthenticated(isAuth)
  }

  useEffect(() => {
    checkAuthentication()
  }, [])

  return { isAuthenticated }
}
