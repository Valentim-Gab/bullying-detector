import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme } from 'react-native'
import { ThemeEnum } from '@/enums/ThemeEnum'

export const ThemeContext = createContext({
  theme: ThemeEnum.Light,
  isSystemTheme: false,
  toggleTheme: () => {},
  setLightTheme: () => {},
  setDarkTheme: () => {},
  setSystemTheme: (theme?: ThemeEnum) => {},
})

const THEME_STORAGE_KEY = '@app_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [theme, setTheme] = useState<ThemeEnum>(ThemeEnum.Light)
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(false)

  useEffect(() => {
    loadSavedTheme()
  }, [])

  const loadSavedTheme = async () => {
    try {
      const savedTheme = (await AsyncStorage.getItem(
        THEME_STORAGE_KEY
      )) as ThemeEnum

      if (savedTheme && savedTheme !== ThemeEnum.System) setTheme(savedTheme)
      else if (savedTheme === ThemeEnum.System) setSystemTheme()
      else
        setTheme(
          systemColorScheme === 'dark' ? ThemeEnum.Dark : ThemeEnum.Light
        )
    } catch (error) {
      console.error('Failed to load theme:', error)
    }
  }

  const toggleTheme = async () => {
    const newTheme =
      theme === ThemeEnum.Light ? ThemeEnum.Dark : ThemeEnum.Light

    setTheme(newTheme)

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const setLightTheme = async () => {
    setIsSystemTheme(false)
    setTheme(ThemeEnum.Light)

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, ThemeEnum.Light)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const setDarkTheme = async () => {
    setIsSystemTheme(false)
    setTheme(ThemeEnum.Dark)

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, ThemeEnum.Dark)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const setSystemTheme = async (theme?: ThemeEnum) => {
    setIsSystemTheme(true)

    if (theme) {
      setTheme(theme)

      return
    }

    setTheme(systemColorScheme === 'dark' ? ThemeEnum.Dark : ThemeEnum.Light)

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, ThemeEnum.System)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isSystemTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
