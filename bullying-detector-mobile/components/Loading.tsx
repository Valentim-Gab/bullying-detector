import { ActivityIndicator, Modal, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { ThemedText } from './ThemedText'
import React from 'react'

interface LoadingProps {
  visible: boolean
  text?: string
}

export default function Loading({
  visible,
  text = 'Carregando...',
}: LoadingProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size={RFValue(52)} color="#fff" />
        <ThemedText type="small" style={{ marginTop: 16 }}>
          {text}
        </ThemedText>
      </View>
    </Modal>
  )
}
