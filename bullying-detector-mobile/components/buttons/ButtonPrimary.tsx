import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewProps,
} from 'react-native'
import { ThemedText } from '../ThemedText'
import { useTheme } from '@/hooks/useTheme'
import { RFValue } from 'react-native-responsive-fontsize'
import { Colors } from '@/constants/Colors'

type ColorKeys = keyof ReturnType<typeof useTheme>['colors']

interface ButtonPrimaryProps extends PressableProps {
  title?: string
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
  dense?: boolean
  round?: boolean
  flat?: boolean
  noShadow?: boolean
  mini?: boolean
  color?: ColorKeys
  outline?: boolean
}

export default function ButtonPrimary(props: ButtonPrimaryProps) {
  const { colors } = useTheme()
  const scaleValue = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Pressable {...props} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.animatedView,
          {
            backgroundColor: props.color ? colors[props.color] : colors.primary,
          },
          { transform: [{ scale: scaleValue }] },
          props.dense && styles.dense,
          props.round && styles.round,
          props.flat && styles.flat,
          props.noShadow && styles.noShadow,
          props.mini && styles.mini,
          props.outline && styles.outline,
        ]}
      >
        {props.icon && props.icon}
        {props.title && (
          <ThemedText
            style={[styles.text, props.outline && styles.outlineText]}
          >
            {props.title}
          </ThemedText>
        )}
        {props.children && props.children}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  animatedView: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 8,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    fontSize: RFValue(16),
    color: '#fff',
  },
  dense: {
    height: 48,
    paddingVertical: 8,
  },
  round: {
    borderRadius: 999,
    aspectRatio: 1,
    padding: 0,
    height: 48,
  },
  mini: {
    height: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  flat: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  outlineText: {
    color: Colors.light.primary,
  },
  noShadow: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
})
