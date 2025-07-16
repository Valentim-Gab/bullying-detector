import { useTheme } from '@/hooks/useTheme'
import { Stack } from 'expo-router'
// import * as NavigationBar from 'expo-navigation-bar'
import { ActivityIndicator, Appearance, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { useAuth } from '@/hooks/useAuth'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function MainStack() {
  const { colors, isSystemTheme, setSystemTheme } = useTheme()
  const { isAuthenticated, isLoading } = useAuth()

  // useEffect(() => {
  //   NavigationBar.setBackgroundColorAsync(colors.backgroundSecondary)
  // }, [colors])

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

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack initialRouteName={isAuthenticated ? '(protected)' : 'login/index'}>
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
