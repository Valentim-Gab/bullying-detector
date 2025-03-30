import { Text, type TextProps, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { RFValue } from 'react-native-responsive-fontsize'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'small' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme()
  const color = colors.text

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  default: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
  small: {
    fontSize: RFValue(14),
    lineHeight: RFValue(22),
  },
  defaultSemiBold: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
    fontWeight: '600',
  },
  title: {
    fontSize: RFValue(24),
    fontWeight: 'bold',
    lineHeight: RFValue(24),
  },
  subtitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
  },
  link: {
    lineHeight: RFValue(30),
    fontSize: RFValue(16),
    color: '#0a7ea4',
  },
})
