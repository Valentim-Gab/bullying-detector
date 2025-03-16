import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import ThemedStatusBar from '@/components/ThemedStatusBar'
import MainStack from './MainStack'

// Prevent the splash screen from auto-hiding before asset loading is complete.
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
    <ThemeProvider>
      <ThemedStatusBar />
      <MainStack />
    </ThemeProvider>
  )
}
