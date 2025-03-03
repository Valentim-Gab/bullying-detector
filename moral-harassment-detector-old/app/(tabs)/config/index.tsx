import { StyleSheet, View } from 'react-native'
import { useColorScheme } from 'nativewind'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { getTheme, saveTheme } from '@/stores/ThemeStore'
import { ThemedScroll } from '@/components/ThemedScroll'
import { ThemedText } from '@/components/ThemedText'
import { useState } from 'react'
import { Colors } from '@/constants/Colors'
import Checkbox from 'expo-checkbox'

export default function ValeScreen() {
  const { colorScheme, setColorScheme } = useColorScheme()
  const [isCheckedSystem, setCheckedSystem] = useState(
    getTheme() === ThemeEnum.System
  )

  const changeTheme = (theme: ThemeEnum) => {
    setCheckedSystem(false)
    setColorScheme(theme)
    saveTheme(theme)
  }

  const setSystem = (value: boolean) => {
    setCheckedSystem(value)

    if (value) {
      setColorScheme(ThemeEnum.System)
      saveTheme(ThemeEnum.System)
    }
  }

  return (
    <ThemedScroll className="flex-1">
      <View style={styles.container}>
        <ThemedText type="subtitle">Tema</ThemedText>
        <View style={styles.checkboxSection}>
          <Checkbox
            style={styles.checkbox}
            value={ThemeEnum.Light === colorScheme && !isCheckedSystem}
            color={Colors.light.primary}
            onValueChange={(value) => changeTheme(ThemeEnum.Light)}
          />
          <ThemedText>Claro</ThemedText>
        </View>
        <View style={styles.checkboxSection}>
          <Checkbox
            style={styles.checkbox}
            value={ThemeEnum.Dark === colorScheme && !isCheckedSystem}
            color={Colors.light.primary}
            onValueChange={(value) => changeTheme(ThemeEnum.Dark)}
          />
          <ThemedText>Escuro</ThemedText>
        </View>
        <View style={styles.checkboxSection}>
          <Checkbox
            style={styles.checkbox}
            value={isCheckedSystem}
            color={Colors.light.primary}
            onValueChange={setSystem}
          />
          <ThemedText>Sistema</ThemedText>
        </View>
      </View>
    </ThemedScroll>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    padding: 32,
  },
  checkboxSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
})
