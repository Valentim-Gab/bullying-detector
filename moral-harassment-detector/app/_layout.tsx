import { getAsyncTheme, saveTheme } from '@/stores/ThemeStore'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useColorScheme } from 'nativewind'
import {
  Appearance,
  StatusBar,
  useColorScheme as useNativeColorScheme,
} from 'react-native'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { ThemeEnum } from '@/enums/ThemeEnum'
import * as NavigationBar from 'expo-navigation-bar'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const nativeColorScheme = useNativeColorScheme() ?? ThemeEnum.Light

  StatusBar.setBarStyle(
    colorScheme === ThemeEnum.Dark ? 'light-content' : 'dark-content'
  )
  NavigationBar.setBackgroundColorAsync(
    colorScheme === ThemeEnum.Light ? 'white' : '#111'
  )

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    async function setStoredTheme() {
      const storedTheme = await getAsyncTheme()

      if (!storedTheme) {
        saveTheme(ThemeEnum.System)
        return
      }

      if (storedTheme === ThemeEnum.System) {
        setColorScheme(nativeColorScheme)
      } else {
        setColorScheme(storedTheme)
      }
    }

    setStoredTheme()
  }, [nativeColorScheme])

  useEffect(() => {
    const subscription = () => {
      const handleChange = () => {
        const currentTheme =
          nativeColorScheme === ThemeEnum.Dark
            ? ThemeEnum.Dark
            : ThemeEnum.Light
        setColorScheme(currentTheme)
      }

      const subscription = Appearance.addChangeListener(handleChange)

      return () => {
        subscription.remove()
      }
    }

    const unsubscribe = subscription()

    return () => unsubscribe()
  }, [nativeColorScheme])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  return (
    <ThemeProvider
      value={colorScheme === ThemeEnum.Dark ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen
          name="(modals)/modal-detect/[id]"
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="phrase/[id]"
          options={({ route }) => ({
            headerTitle: `Detecção #${
              (route.params as { id: number })?.id ?? 0
            }`,
            animation: 'slide_from_right',
          })}
        />
      </Stack>
    </ThemeProvider>
  )
}
