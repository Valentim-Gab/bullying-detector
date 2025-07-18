import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import { getGlobalQueryClient } from '@/utils/queryUtil'
import Toast from 'react-native-toast-message'
import ThemedStatusBar from '@/components/ThemedStatusBar'
import MainStack from './MainStack'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <QueryClientProvider client={getGlobalQueryClient()}>
      <ThemeProvider>
        <ThemedStatusBar />
        <MainStack />
        <Toast />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
