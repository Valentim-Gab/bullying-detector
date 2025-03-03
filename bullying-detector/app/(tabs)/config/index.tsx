import { StyleSheet, View } from 'react-native'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { ThemedScroll } from '@/components/ThemedScroll'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/hooks/useTheme'
import Checkbox from 'expo-checkbox'

export default function ConfigScreen() {
  const { theme, isSystemTheme, setLightTheme, setDarkTheme, setSystemTheme } =
    useTheme()

  return (
    <ThemedScroll style={styles.scroll}>
      <View style={styles.container}>
        <ThemedText type="subtitle">Tema</ThemedText>
        <View style={styles.checkboxSection}>
          <Checkbox
            style={styles.checkbox}
            value={ThemeEnum.Light === theme && !isSystemTheme}
            color={Colors.light.primary}
            onValueChange={() => setLightTheme()}
          />
          <ThemedText>Claro</ThemedText>
        </View>
        <View style={styles.checkboxSection}>
          <Checkbox
            style={styles.checkbox}
            value={ThemeEnum.Dark === theme && !isSystemTheme}
            color={Colors.light.primary}
            onValueChange={() => setDarkTheme()}
          />
          <ThemedText>Escuro</ThemedText>
        </View>
        <View style={styles.checkboxSection}>
          <Checkbox
            style={styles.checkbox}
            value={isSystemTheme}
            color={Colors.light.primary}
            onValueChange={() => setSystemTheme()}
          />
          <ThemedText>Sistema</ThemedText>
        </View>
      </View>
    </ThemedScroll>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
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
