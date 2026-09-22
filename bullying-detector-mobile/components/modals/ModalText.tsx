import React from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { ThemedView } from '../ThemedView'
import { useTheme } from '@/hooks/useTheme'
import { ThemedText } from '../ThemedText'
import ButtonPrimary from '../buttons/ButtonPrimary'
import { Ionicons } from '@expo/vector-icons'

export default function ModalText({
  visible,
  title,
  text,
  handleClose,
}: {
  visible: boolean
  title: string
  text: string
  handleClose: () => void
}) {
  const { colors } = useTheme()

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
        }}
      >
        <ThemedView
          style={{
            margin: 20,
            padding: 20,
            borderRadius: 10,
            maxHeight: '60%',
            opacity: 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.mutedStrong,
          }}
        >
          <Pressable
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              padding: 4,
              borderRadius: '100%',
            }}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={colors.mutedForeground} />
          </Pressable>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            {title}
          </ThemedText>
          <ScrollView>
            <ThemedText>{text}</ThemedText>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  )
}
