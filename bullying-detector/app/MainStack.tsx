import { useTheme } from '@/hooks/useTheme'
import { Stack } from 'expo-router'
import * as NavigationBar from 'expo-navigation-bar'
import { Appearance } from 'react-native'
import React, { useEffect } from 'react'
import { ThemeEnum } from '@/enums/ThemeEnum'

export default function MainStack() {
  const {
    colors,
    theme,
    isSystemTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  } = useTheme()

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(colors.backgroundSecondary)
  }, [colors])

  useEffect(() => {
    const updateTheme = () => {
      const systemTheme = Appearance.getColorScheme()

      if (isSystemTheme) {
        setSystemTheme(
          systemTheme === 'dark' ? ThemeEnum.Dark : ThemeEnum.Light
        )
      }
    }

    const listener = Appearance.addChangeListener(updateTheme)

    return () => listener.remove()
  }, [isSystemTheme])

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
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
          } - Database`,
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.backgroundSecondary,
          },
          headerTintColor: colors.text,
        })}
      />
      <Stack.Screen
        name="phrase/details/[id]"
        options={({ route }) => ({
          headerTitle: `Detecção #${
            (route.params as { id: number })?.id ?? 0
          } - Detalhes`,
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.backgroundSecondary,
          },
          headerTintColor: colors.text,
        })}
      />
    </Stack>
  )
}
