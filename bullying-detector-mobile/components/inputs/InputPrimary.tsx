import { useTheme } from '@/hooks/useTheme'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import { ThemedText } from '../ThemedText'
import { RFValue } from 'react-native-responsive-fontsize'
import React from 'react'

interface InputPrimaryProps extends TextInputProps {
  label?: string
  leftIcon?: React.ReactNode
}

export default function InputPrimary(props: InputPrimaryProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.root}>
      {props.label && (
        <ThemedText style={styles.label}>{props.label}</ThemedText>
      )}
      <View style={[styles.inputContiner, { borderColor: colors.border }]}>
        <TextInput
          {...props}
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: 'transparent',
            },
          ]}
        />
        {props.leftIcon && props.leftIcon}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    fontSize: RFValue(14),
    marginBottom: 8,
  },
  inputContiner: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 4,
    fontSize: RFValue(14),
  },
})
