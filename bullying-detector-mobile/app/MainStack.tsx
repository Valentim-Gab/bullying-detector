import { useTheme } from '@/hooks/useTheme'
import { Stack } from 'expo-router'
import * as NavigationBar from 'expo-navigation-bar'
import { Appearance, View } from 'react-native'
import React, { useEffect } from 'react'
import { ThemeEnum } from '@/enums/ThemeEnum'

export default function MainStack() {
  const { colors, isSystemTheme, setSystemTheme } = useTheme()

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack>
        <Stack.Screen
          name="login/index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(protected)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  )
}
