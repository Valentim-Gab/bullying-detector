import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Colors } from '@/constants/Colors'
import { AudioDetect } from '@/interfaces/Audio'
import { AudioService } from '@/services/AudioService'
import { router, useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { EvilIcons, Ionicons } from '@expo/vector-icons'
import { ThemedScroll } from '@/components/ThemedScroll'
import { useTheme } from '@react-navigation/native'
import { useColorScheme } from 'nativewind'

export default function PhraseScreen() {
  const { id } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [audio, setAudio] = useState<AudioDetect | null>(null)
  const [username, setUsername] = useState('')
  const [disableActions, setDisableActions] = useState(false)
  const audioService = useMemo(() => new AudioService(), [])
  const { colorScheme } = useColorScheme()

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

  const handleSend = async (approve: boolean) => {
    if (disableActions) {
      return
    }

    setLoadingSave(true)

    if (!audio || !audio.databaseIdPhrase) {
      return
    }

    const updatePhrase = {
      idDetection: audio.idDetection,
      username: username,
      approve: approve,
    }

    const result = await audioService.updateHarassmentPhrase(
      updatePhrase,
      audio.databaseIdPhrase
    )

    setLoadingSave(false)

    if (result) {
      setUsername('')
      setDisableActions(true)
      fetchAudio(Number(id))
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
      <ScrollView style={{ paddingHorizontal: 32 }}>
        <ThemedText>
          <ThemedText className="font-bold">Texto gerado: </ThemedText>
          {audio.recordingTranscribed}
        </ThemedText>
        <ThemedView className="mt-4">
          <ThemedText>
            Registre a sua opinião se o texto gerado contém assédio moral
          </ThemedText>
          <ThemedText className="mt-4">Nome:</ThemedText>
          <TextInput
            className="border dark:border-white dark:text-white rounded-xl p-4 mt-2 mb-6"
            placeholder="Digite seu nome de usuário"
            placeholderTextColor={Colors.light.placeholder}
            value={username}
            readOnly={disableActions}
            style={disableActions ? { opacity: 0.2 } : {}}
            onChangeText={setUsername}
          />
          <View className="flex flex-row justify-between">
            <Pressable
              className="bg-negative rounded-xl p-2 items-center w-[48%]"
              disabled={loading || disableActions}
              style={disableActions ? { opacity: 0.2 } : {}}
              onPress={() => handleSend(false)}
            >
              <View
                className="bg-transparent rounded flex-row items-center justify-center gap-x-1"
                style={[{ opacity: loading ? 0.6 : 1 }]}
              >
                <Ionicons name="close" size={32} color="white" />
                <Text className="text-white text-base">Desconsiderar</Text>
              </View>
            </Pressable>
            <Pressable
              className="bg-positive rounded-xl p-2 items-center w-[48%]"
              disabled={loading || disableActions}
              onPress={() => handleSend(true)}
              style={disableActions ? { opacity: 0.2 } : {}}
            >
              <View
                className="bg-transparent rounded flex-row items-center justify-center gap-x-1"
                style={[{ opacity: loading ? 0.6 : 1 }]}
              >
                <Ionicons name="checkmark" size={32} color="white" />
                <Text className="text-white text-base">Considerar</Text>
              </View>
            </Pressable>
          </View>
        </ThemedView>
        <View className="min-h-[300px] mt-12 mb-32 py-6 rounded-xl border-muted-strong dark:border-dark-muted border bg-card dark:bg-dark-card">
          <View className="px-6">
            <ThemedText type="subtitle">Opiniões dos usuários</ThemedText>
            <View className="flex flex-row justify-between gap-x-2 mt-4">
              <Text className="text-negative text-base mb-2">
                Desconsidera ({audio.databaseRejectUserList?.length ?? 0})
              </Text>
              <Ionicons
                name="close"
                size={28}
                color={colorScheme == 'dark' ? 'white' : 'black'}
              />
              <Text className="text-positive text-base mb-2">
                ({audio.databaseApproveUserList?.length ?? 0}) Considera
              </Text>
            </View>
          </View>
          <View className="px-6">
            <View className="flex flex-row justify-between gap-x-4">
              <View>
                {audio.databaseRejectUserList &&
                  audio.databaseRejectUserList.map((user, index) => (
                    <ThemedText key={index}>{user}</ThemedText>
                  ))}
              </View>
              <View className="flex flex-col gap-0 flex-nowrap">
                {audio.databaseApproveUserList &&
                  audio.databaseApproveUserList.map((user, index) => (
                    <ThemedText key={index} className="text-right">
                      {user ? user : '-'}
                    </ThemedText>
                  ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {loadingSave && (
        <ThemedView className="flex-1 items-center justify-center bg-[#ffffff9d] dark:bg-[#0000009d] w-full h-full absolute">
          <ActivityIndicator color={Colors.light.primary} size="large" />
        </ThemedView>
      )}
    </ThemedSafeView>
  )
}
