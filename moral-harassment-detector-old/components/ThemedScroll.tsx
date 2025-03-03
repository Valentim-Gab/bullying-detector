import { useThemeColor } from '@/hooks/useThemeColor'
import { ScrollView } from 'react-native'
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context'

interface ThemedViewProps extends SafeAreaViewProps {
  lightColor?: string
  darkColor?: string
}

export function ThemedScroll({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  )

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
