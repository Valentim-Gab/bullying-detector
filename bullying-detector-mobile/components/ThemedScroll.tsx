import { useTheme } from '@/hooks/useTheme'
import { ScrollView, ScrollViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ThemedViewProps extends ScrollViewProps {
  lightColor?: string
  darkColor?: string
}

export function ThemedScroll({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme()
  const backgroundColor = colors.background

  return (
    <SafeAreaView style={[{ backgroundColor }, style]}>
      <ScrollView
        style={[{ backgroundColor }, style]}
        {...otherProps}
        className="flex-1"
      />
    </SafeAreaView>
  )
}
