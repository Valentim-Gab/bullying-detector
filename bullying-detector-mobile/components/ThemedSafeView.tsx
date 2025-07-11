import { useTheme } from '@/hooks/useTheme'
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context'

interface ThemedViewProps extends SafeAreaViewProps {
  lightColor?: string
  darkColor?: string
}

export function ThemedSafeView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme()
  const backgroundColor = colors.background

  return <SafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />
}
