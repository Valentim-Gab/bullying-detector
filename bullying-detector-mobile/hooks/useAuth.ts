import { useState, useEffect } from 'react'
import { checkAuth } from '@/services/AuthService'
import * as SecureStore from 'expo-secure-store'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkAuthentication = async () => {
    setIsLoading(true)

    const hasToken = await SecureStore.getItemAsync('access_token')

    if (!hasToken) {
      setIsAuthenticated(false)
      setIsLoading(false)

      return
    }

    try {
      const isAuth = await checkAuth()
      setIsAuthenticated(isAuth)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthentication()
  }, [])

  return { isAuthenticated, isLoading }
}
