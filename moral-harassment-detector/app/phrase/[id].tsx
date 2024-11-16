import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Colors } from '@/constants/Colors'
import { AudioDetect } from '@/interfaces/Audio'
import { AudioService } from '@/services/AudioService'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native'

export default function PhraseScreen() {
  const { id } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [audio, setAudio] = useState<AudioDetect | null>(null)
  const [username, setUsername] = useState('')
  const audioService = useMemo(() => new AudioService(), [])

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
  }, [])

  const handleSend = async () => {
    setLoadingSave(true)

    if (!audio) {
      return
    }

    const result = await audioService.saveHarassmentPhrase({
      phrase: audio.recordingTranscribed,
      username: username,
      idDetection: audio.idDetection,
    })

    setLoadingSave(false)

    if (result) {
      router.back()
    }
  }

  if (loading) {
    return (
      <ThemedSafeView className="flex-1 p-8">
        <ThemedText>Carregando...</ThemedText>
      </ThemedSafeView>
    )
  }

  if (!audio) {
    return (
      <ThemedSafeView className="flex-1 p-8">
        <ThemedText>Audio não encontrado.</ThemedText>
      </ThemedSafeView>
    )
  }

  return (
    <ThemedSafeView className="flex-1 dark:border-t dark:border-dark-muted">
      <ThemedView className="p-8 flex-1">
        <ThemedText>
          <ThemedText className="font-bold">Texto gerado: </ThemedText>
          {audio.recordingTranscribed}
        </ThemedText>
        <ThemedView className="mt-8">
          <ThemedText>Nome:</ThemedText>
          <TextInput
            className="border dark:border-white dark:text-white rounded-xl p-4 mt-2 mb-8"
            placeholder="Digite seu nome de usuário"
            placeholderTextColor={Colors.light.placeholder}
            value={username}
            onChangeText={setUsername}
          />
          <Pressable
            className="bg-primary rounded-xl p-4 items-center"
            disabled={loading}
            onPress={handleSend}
          >
            <ThemedView
              className="bg-primary rounded flex-row items-center justify-center"
              style={[{ opacity: loading ? 0.6 : 1 }]}
            >
              {!loading && <Text className="text-white text-base">Enviar</Text>}
              {loading && (
                <ThemedView className="flex-row gap-x-2 items-center justify-center">
                  <ActivityIndicator color="#fff" size="large" />
                  <Text className="text-white text-base">
                    Processando áudio
                  </Text>
                </ThemedView>
              )}
            </ThemedView>
          </Pressable>
        </ThemedView>
        <ThemedText className="mt-8 text-justify">
          Ao enviar, o texto gerado passará a ser considerado assédio moral para
          o nosso sistema. Registre seu nome para que os outros usuários possam
          verificar a autenticidade da denúncia.
        </ThemedText>
      </ThemedView>
      {loadingSave && (
        <ThemedView className="flex-1 items-center justify-center bg-[#ffffff9d] dark:bg-[#0000009d] w-full h-full absolute">
          <ActivityIndicator color={Colors.light.primary} size="large" />
        </ThemedView>
      )}
    </ThemedSafeView>
  )
}
