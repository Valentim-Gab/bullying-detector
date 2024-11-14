import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Button,
  ScrollView,
  Pressable,
  Text,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { Audio } from 'expo-av'
import { AudioService } from '@/services/AudioService'
import * as FileSystem from 'expo-file-system'
import { IOSOutputFormat } from 'expo-av/build/Audio'
import { ThemedText } from '@/components/ThemedText'
import { ThemedSafeView } from '@/components/ThemedSafeView'
import { Colors } from '@/constants/Colors'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import { AudioDetect } from '@/interfaces/Audio'

export default function RecordScreen() {
  const audioService = useMemo(() => new AudioService(), [])
  const [recording, setRecording] = useState<any>()
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioList, setAudioList] = useState<AudioDetect[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDetect, setLoadingDetect] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [permissionResponse, requestPermission] = Audio.usePermissions()

  const fetchAllAudio = async () => {
    setLoading(true)

    const data = await audioService.getAll()

    if (data) {
      setAudioList(data)
    }

    setLoading(false)
  }

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== 'granted') {
        console.log('Requesting permission..')
        await requestPermission()
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      console.log('Starting recording..')

      const { ios, android } = Audio.RecordingOptionsPresets.HIGH_QUALITY
      const { recording } = await Audio.Recording.createAsync({
        android: android,
        ios: {
          ...ios,
          extension: '.mp4',
          outputFormat: IOSOutputFormat.MPEG4AAC,
        },
      } as Audio.RecordingOptions)

      setRecording(recording)
      console.log('Recording started')
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }

  async function stopRecording() {
    setLoadingDetect(true)
    setRecording(undefined)
    await recording.stopAndUnloadAsync()
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    })
    const uri = recording.getURI()

    // Mover o arquivo para o diretório de documentos
    const newUri = `${FileSystem.documentDirectory}recording.m4a`
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    })
    setAudioUri(newUri)
    console.log('Recording moved to', newUri)

    const recordCover = {
      uri: newUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    }

    const result = await transcribeAudio(recordCover)
    // Reproduzir o áudio após parar a gravação
    await playSound(newUri)
    setLoadingDetect(false)

    if (result) {
      fetchAllAudio()
    }
  }

  async function playSound(uri: string) {
    console.log('Loading sound from', uri)
    const { sound } = await Audio.Sound.createAsync({ uri })
    setSound(sound)
    console.log('Playing sound')
    await sound.playAsync()
  }

  async function transcribeAudio(recordCover: any) {
    const times = 4

    let isSuccess = await audioService.detect(recordCover)

    for (let i = 0; i < times; i++) {
      if (!isSuccess) {
        isSuccess = await audioService.detect(recordCover)
      }
    }

    return isSuccess
  }

  useEffect(() => {
    fetchAllAudio()
  }, [])

  // Descarregar o som quando o componente for desmontado
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  const scaleValue = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9, // Reduz o tamanho para 90% quando pressionado
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Volta ao tamanho normal ao soltar
      useNativeDriver: true,
    }).start()
  }

  return (
    <ThemedSafeView className="flex-1 p-8">
      <View className="flex flex-col gap-y-4">
        <ThemedText type="subtitle">Gravar conversa</ThemedText>
        <ThemedText>
          Ao finalizar a gravação, será realizado um processamento para detectar
          se houve assédio moral
        </ThemedText>
        <View className="mt-4">
          <Pressable
            disabled={loadingDetect}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={recording ? stopRecording : startRecording}
            style={({ pressed }) => [styles.button]}
          >
            <Animated.View
              className="bg-primary opacity-40 p-4 rounded flex-row items-center justify-center"
              style={[
                styles.button,
                { transform: [{ scale: scaleValue }] },
                { opacity: loadingDetect ? 0.6 : 1 },
              ]}
            >
              {!loadingDetect && (
                <Text className="text-white text-base">
                  {recording ? 'Parar gravação' : 'Começar a gravar'}
                </Text>
              )}
              {loadingDetect && (
                <View className="flex-row gap-x-2 items-center justify-center">
                  <ActivityIndicator color="#fff" size="large" />
                  <Text className="text-white text-base">
                    Processando áudio
                  </Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </View>
      </View>
      <View className="mt-16 flex-1">
        <View className="flex-row gap-x-2 justify-between items-center">
          <ThemedText type="subtitle">Últimas detecções</ThemedText>
          <Ionicons
            name="refresh"
            size={24}
            color={Colors.light.primary}
            onPress={fetchAllAudio}
          />
        </View>
        <View className="flex-1 rounded-xl overflow-hidden border-muted-strong dark:border-dark-muted border h-24 mt-4 bg-card dark:bg-dark-card">
          {audioList && audioList.length > 0 && (
            <ScrollView>
              {audioList.map((audio) => (
                <Pressable
                  key={audio.idDetection}
                  onPress={() => {
                    router.push(`/modal-detect/${audio.idDetection}`)
                  }}
                  className="flex-row items-center justify-between p-4 border-b border-muted-strong dark:border-dark-muted w-full"
                >
                  <ThemedText className="flex-auto">
                    {audio.recordingTranscribed.length > 50
                      ? `${audio.recordingTranscribed.substring(0, 50)}...`
                      : audio.recordingTranscribed}
                  </ThemedText>
                  <View className="ml-2 p-1">
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={Colors.light.primary}
                    />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {loading && (
            <View className="flex-1 items-center justify-center bg-[#ffffff9d] dark:bg-[#0000009d] absolute w-full h-full">
              <ActivityIndicator color={Colors.light.primary} size="large" />
            </View>
          )}
          {(!audioList || audioList.length < 0) && !loading && (
            <View className="flex-1 items-center justify-center gap-4">
              <FontAwesome
                name="file-audio-o"
                size={48}
                color={Colors.light.primary}
              />
              <ThemedText>Nenhuma detecção foi encontrada</ThemedText>
            </View>
          )}
        </View>
      </View>
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    height: 72,
  },
})
