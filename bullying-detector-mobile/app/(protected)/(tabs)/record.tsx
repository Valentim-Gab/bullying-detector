import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
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
import { router } from 'expo-router'
import { AudioDetect } from '@/interfaces/Audio'
import { useTheme } from '@/hooks/useTheme'
import { ThemeEnum } from '@/enums/ThemeEnum'

export default function RecordScreen() {
  const audioService = useMemo(() => new AudioService(), [])
  const [recording, setRecording] = useState<any>()
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioList, setAudioList] = useState<AudioDetect[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDetect, setLoadingDetect] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [permissionResponse, requestPermission] = Audio.usePermissions()
  const { colors, theme } = useTheme()

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
        await requestPermission()
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

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
    const { sound } = await Audio.Sound.createAsync({ uri })

    setSound(sound)
    await sound.playAsync()
  }

  async function transcribeAudio(recordCover: any) {
    const times = 4

    let isSuccess = await audioService.detect(recordCover)

    // for (let i = 0; i < times; i++) {
    //   if (!isSuccess) {
    //     isSuccess = await audioService.detect(recordCover)
    //   }
    // }

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
    <ThemedSafeView style={styles.container}>
      <View style={styles.viewRecord}>
        <ThemedText type="title">Gravar conversa</ThemedText>
        <ThemedText>
          Ao finalizar a gravação, será realizado um processamento para detectar
          se houve assédio moral
        </ThemedText>
        <View style={styles.sectionBtn}>
          <Pressable
            disabled={loadingDetect}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={recording ? stopRecording : startRecording}
            style={({ pressed }) => [styles.button]}
          >
            <Animated.View
              style={[
                styles.animatedView,
                styles.button,
                { transform: [{ scale: scaleValue }] },
                { opacity: loadingDetect ? 0.6 : 1 },
              ]}
            >
              {!loadingDetect && (
                <Text style={styles.btnText}>
                  {recording ? 'Parar gravação' : 'Começar a gravar'}
                </Text>
              )}
              {loadingDetect && (
                <View style={styles.containerBtnTextRecording}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={styles.btnText}>Processando áudio</Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        </View>
      </View>
      <View style={styles.viewDetections}>
        <View style={styles.detectionsTitle}>
          <ThemedText type="subtitle">Últimas detecções</ThemedText>
          <Ionicons
            name="refresh"
            size={24}
            color={Colors.light.primary}
            onPress={fetchAllAudio}
          />
        </View>
        <View
          style={[
            styles.detectionsSection,
            { backgroundColor: colors.card },
            { borderColor: colors.mutedStrong },
          ]}
        >
          {audioList && audioList.length > 0 && (
            <ScrollView>
              {audioList.map((audio) => (
                <Pressable
                  key={audio.idDetection}
                  onPress={() => {
                    router.push(`/modal-detect/${audio.idDetection}`)
                  }}
                  style={[
                    styles.btnAccess,
                    { borderColor: colors.mutedStrong },
                  ]}
                >
                  <ThemedText style={styles.btnAccessText}>
                    {audio.mainText.length > 50
                      ? `${audio.mainText.substring(0, 50)}...`
                      : audio.mainText}
                  </ThemedText>
                  <View style={styles.btnAccessIconSection}>
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
            <View
              style={[
                styles.detectionSectionLoading,
                {
                  backgroundColor:
                    theme == ThemeEnum.Light ? '#ffffff9d' : '#0000009d',
                },
              ]}
            >
              <ActivityIndicator color={Colors.light.primary} size="large" />
            </View>
          )}
          {(!audioList || audioList.length <= 0) && !loading && (
            <View style={styles.detectionSectionEmpty}>
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
  container: {
    flex: 1,
    padding: 32,
  },
  viewRecord: {
    flexDirection: 'column',
    gap: 16,
  },
  sectionBtn: {
    marginTop: 16,
  },
  animatedView: {
    backgroundColor: Colors.light.primary,
    opacity: 0.4,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    height: 72,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
  containerBtnTextRecording: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetections: {
    marginTop: 64,
    flex: 1,
  },
  detectionsTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  detectionsSection: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    height: 96,
    marginTop: 16,
  },
  btnAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Colors.light.mutedStrong,
  },
  btnAccessText: {
    flex: 1,
  },
  btnAccessIconSection: {
    marginLeft: 8,
    padding: 4,
  },
  detectionSectionLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff9d',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  detectionSectionEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
})
