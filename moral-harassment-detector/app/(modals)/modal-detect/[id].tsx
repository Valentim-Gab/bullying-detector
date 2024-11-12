import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Modal, View, Pressable, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { Colors } from '@/constants/Colors'
import { useEffect, useMemo, useState } from 'react'
import { AudioService } from '@/services/AudioService'
import { AudioDetect } from '@/interfaces/Audio'
import Skeleton from 'expo-skeleton-component'

export default function ModalDetectScreen() {
  const navigation = useNavigation()
  const audioService = useMemo(() => new AudioService(), [])
  const [modalVisible, setModalVisible] = useState(false)
  const [audio, setAudio] = useState<AudioDetect | null>(null)
  const [loading, setLoading] = useState(false)
  const { colorScheme } = useColorScheme()
  const { id } = useLocalSearchParams()

  const fetchAudio = async (id: number) => {
    setLoading(true)

    const data = await audioService.get(id)

    if (data) {
      setAudio(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAudio(Number(id))

    const unsubscribeFocus = navigation.addListener('focus', () => {
      setModalVisible(true)
    })

    const unsubscribeBlur = navigation.addListener('blur', () => {
      setModalVisible(false)
    })

    return () => {
      unsubscribeFocus()
      unsubscribeBlur()
    }
  }, [navigation])

  const closeModal = () => {
    setModalVisible(false)
    navigation.goBack()
  }

  const getIcon = (value?: boolean) => {
    if (value) {
      return (
        <Ionicons name="checkmark-circle" size={48} color={Colors.positive} />
      )
    }

    return <Ionicons name="close-circle" size={48} color={Colors.negative} />
  }

  return (
    <View style={{ backgroundColor: '#00000094', flex: 1 }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <Pressable style={{ height: 100 }} onPress={closeModal}></Pressable>
        <ThemedView className="flex-1 rounded-t-xl p-8">
          <Pressable className="absolute top-3 right-3" onPress={closeModal}>
            <Ionicons
              name="close"
              size={24}
              color={colorScheme == ThemeEnum.Light ? 'black' : 'white'}
            />
          </Pressable>
          <ThemedText type="subtitle">
            Resultado da detecção:{' '}
            {audio ? `#${audio.idDetection}` : 'buscando...'}
          </ThemedText>
          <ThemedText className="mt-4 font-bold">Texto gerado:</ThemedText>
          {audio && (
            <ThemedText className="mt-1">
              {audio.recordingTranscribed}
            </ThemedText>
          )}
          {!audio && loading && (
            <Skeleton
              containerStyle={{ marginTop: 8 }}
              boneColor={colorScheme === ThemeEnum.Light ? '#f0f0f0' : '#333'}
              highlightColor={colorScheme === ThemeEnum.Light ? '#fff' : '#444'}
              isLoading={loading}
              layout={[
                {
                  width: '100%',
                  height: 58,
                },
              ]}
            />
          )}
          <View className="flex-col justify-center gap-y-4 mt-4">
            <View className="flex-row items-center border border-muted-strong rounded-xl p-4">
              <Image
                source={require('@/assets/images/mistral-logo.png')}
                className="w-12 h-12"
              />
              <ThemedText className="flex-1 text-xl mx-4">
                Mistral AI
              </ThemedText>
              {audio && getIcon(audio.mistralResult)}
              {!audio && loading && (
                <ActivityIndicator color={Colors.light.primary} size="large" />
              )}
            </View>
            <View className="flex-row items-center border border-muted-strong rounded-xl p-4">
              <Image
                source={require('@/assets/images/cohere-logo.png')}
                className="w-12 h-12"
              />
              <ThemedText className="flex-1 text-xl mx-4">Cohere AI</ThemedText>
              {audio && getIcon(audio.cohereResult)}
              {!audio && loading && (
                <ActivityIndicator color={Colors.light.primary} size="large" />
              )}
            </View>
            <View className="flex-row items-center border border-muted-strong rounded-xl p-4">
              <Image
                source={require('@/assets/images/database-logo.png')}
                className="w-12 h-12"
              />
              <ThemedText className="flex-1 text-xl mx-4">Database</ThemedText>
              {audio && getIcon(audio.databaseResult)}
              {!audio && loading && (
                <ActivityIndicator color={Colors.light.primary} size="large" />
              )}
            </View>
            <View className="flex-row items-center border border-muted-strong rounded-xl p-4">
              <Image
                source={require('@/assets/images/similarity-logo.png')}
                className="w-12 h-12"
              />
              <ThemedText className="flex-1 text-xl mx-4">
                Similaridade
              </ThemedText>
              {audio && getIcon(audio.similarityResult)}
              {!audio && loading && (
                <ActivityIndicator color={Colors.light.primary} size="large" />
              )}
            </View>
          </View>
        </ThemedView>
      </Modal>
    </View>
  )
}
