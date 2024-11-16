import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import {
  Modal,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  Button,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { Colors } from '@/constants/Colors'
import { useEffect, useMemo, useState } from 'react'
import { AudioService } from '@/services/AudioService'
import { AudioDetect } from '@/interfaces/Audio'
import { ScrollView } from 'react-native'
import { Audio } from 'expo-av'
import { Environment } from '@/environments/environment'
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
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setModalVisible(true)
      fetchAudio(Number(id))
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

  const getDatabaseTextEntity = (text: string) => {
    return text.toUpperCase() === 'SISTEMA' ? text : `usuário ${text}`
  }

  async function playSound(filename: string) {
    const { sound: playbackObject } = await Audio.Sound.createAsync(
      {
        uri: `${Environment.apiUrl}/audio/download/${filename}`,
      },
      { shouldPlay: true }
    )

    await playbackObject.playAsync()
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
        <Pressable style={{ height: 60 }} onPress={closeModal}></Pressable>
        <ThemedView className="flex-1 rounded-t-xl py-8">
          <Pressable className="absolute top-3 right-3" onPress={closeModal}>
            <Ionicons
              name="close"
              size={24}
              color={colorScheme == ThemeEnum.Light ? 'black' : 'white'}
            />
          </Pressable>
          <View className="px-8">
            <ThemedText type="subtitle">
              Resultado da detecção:{' '}
              {audio ? `#${audio.idDetection}` : 'buscando...'}
            </ThemedText>
            <View className="flex-row justify-between items-center gap-x-2 mt-6">
              <ThemedText className="font-bold">Texto gerado:</ThemedText>
              {audio && (
                <Pressable
                  className="rounded-full border-2 border-primary dark:bg-white items-center justify-center p-1"
                  onPress={() => playSound(audio.recordingAudio)}
                >
                  <Ionicons
                    name="play"
                    size={24}
                    color={Colors.light.primary}
                  />
                </Pressable>
              )}
            </View>
            {audio && (
              <ThemedText className="mt-1">
                {audio.recordingTranscribed}
              </ThemedText>
            )}
            {!audio && loading && (
              <Skeleton
                containerStyle={{ marginTop: 8 }}
                boneColor={colorScheme === ThemeEnum.Light ? '#f0f0f0' : '#333'}
                highlightColor={
                  colorScheme === ThemeEnum.Light ? '#fff' : '#444'
                }
                isLoading={loading}
                layout={[
                  {
                    width: '100%',
                    height: 58,
                  },
                ]}
              />
            )}
          </View>
          <ScrollView style={{ paddingHorizontal: 32 }}>
            <View className="flex-col justify-center gap-y-4 mt-4">
              <View className="border border-muted-strong dark:border-dark-muted rounded-xl p-4">
                <View className="flex-row items-center">
                  <Image
                    source={require('@/assets/images/mistral-logo.png')}
                    className="w-12 h-12"
                  />
                  <ThemedText className="flex-1 text-xl mx-4">
                    Mistral AI
                  </ThemedText>
                  {audio && getIcon(audio.mistralResult)}
                  {!audio && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                <ThemedText className="mt-4">
                  <ThemedText className="font-bold">Resposta:</ThemedText>{' '}
                  {audio?.mistralMessage ?? 'não disponível'}
                </ThemedText>
              </View>
              <View className="border border-muted-strong dark:border-dark-muted rounded-xl p-4">
                <View className="flex-row items-center">
                  <Image
                    source={require('@/assets/images/cohere-logo.png')}
                    className="w-12 h-12"
                  />
                  <ThemedText className="flex-1 text-xl mx-4">
                    Cohere AI
                  </ThemedText>
                  {audio && getIcon(audio.cohereResult)}
                  {!audio && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                <ThemedText className="mt-4">
                  <ThemedText className="font-bold">Resposta:</ThemedText>{' '}
                  {audio?.cohereMessage ?? 'não disponível'}
                </ThemedText>
              </View>
              <View className="border border-muted-strong dark:border-dark-muted rounded-xl p-4">
                <View className="flex-row items-center">
                  <Image
                    source={require('@/assets/images/database-logo.png')}
                    className="w-12 h-12"
                  />
                  <ThemedText className="flex-1 text-xl mx-4">
                    Database
                  </ThemedText>
                  {audio && getIcon(audio.databaseResult)}
                  {!audio && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                {audio && audio.databaseResult && audio.databaseUsername && (
                  <ThemedText className="mt-4">
                    A gravação contém palavras consideradas assédio pelo{' '}
                    <ThemedText className="font-bold">
                      {getDatabaseTextEntity(audio.databaseUsername)}
                    </ThemedText>
                    .
                  </ThemedText>
                )}
                {audio && !audio.databaseResult && (
                  <Pressable
                    className="bg-secondary rounded-xl px-2 py-3 mt-4 justify-center items-center"
                    onPress={() => router.push(`/phrase/${audio.idDetection}`)}
                  >
                    <ThemedText className="text-white">
                      Salvar texto como assédio moral
                    </ThemedText>
                  </Pressable>
                )}
              </View>
              <View className="flex-row items-center border border-muted-strong dark:border-dark-muted rounded-xl p-4">
                <Image
                  source={require('@/assets/images/similarity-logo.png')}
                  className="w-12 h-12"
                />
                <ThemedText className="flex-1 text-xl mx-4">
                  Similaridade
                </ThemedText>
                {audio && getIcon(audio.similarityResult)}
                {!audio && loading && (
                  <ActivityIndicator
                    color={Colors.light.primary}
                    size="large"
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </View>
  )
}
