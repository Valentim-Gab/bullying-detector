import React, { useRef } from 'react'
import {
  Animated,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewProps,
} from 'react-native'
import { ThemedText } from '../ThemedText'
import { useTheme } from '@/hooks/useTheme'
import { RFValue } from 'react-native-responsive-fontsize'
import { Ionicons } from '@expo/vector-icons'

interface ButtonPrimaryProps extends PressableProps {
  title?: string
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
  dense?: boolean
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
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.button]}
    >
      <Animated.View
        style={[
          styles.animatedView,
          { backgroundColor: colors.primary },
          { transform: [{ scale: scaleValue }] },
          props.dense && styles.dense,
        ]}
      >
        {props.icon && props.icon}
        {props.title && (
          <ThemedText style={styles.text}>{props.title}</ThemedText>
        )}
        {props.children && props.children}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
  },
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
})
