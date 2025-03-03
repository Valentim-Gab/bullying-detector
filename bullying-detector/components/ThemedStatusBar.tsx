import { ThemeEnum } from '@/enums/ThemeEnum'
import { useTheme } from '@/hooks/useTheme'
import { StatusBar } from 'expo-status-bar'
import React from 'react'

export default function ThemedStatusBar() {
  const { theme } = useTheme()

  return (
    <StatusBar
      style={theme === ThemeEnum.Dark ? 'light' : 'dark'}
      translucent={true}
    />
  )
}
