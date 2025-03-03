import { Colors } from '@/constants/Colors'
import { ThemeContext } from '@/contexts/ThemeContext'
import { useContext } from 'react'

export function useTheme() {
  const {
    theme,
    isSystemTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  } = useContext(ThemeContext)
  const colors = Colors[theme === 'light' ? 'light' : 'dark']

  return {
    theme,
    colors,
    isSystemTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  }
}
