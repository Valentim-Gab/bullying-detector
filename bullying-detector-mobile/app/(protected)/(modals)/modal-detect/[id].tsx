import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import {
  Modal,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { Colors } from '@/constants/Colors'
import { useEffect, useMemo, useState } from 'react'
import { AudioService } from '@/services/AudioService'
import { AudioDetect } from '@/interfaces/Audio'
import { ScrollView } from 'react-native'
import { Audio } from 'expo-av'
import { Environment } from '@/environments/environment'
import { useTheme } from '@/hooks/useTheme'
import Skeleton from 'expo-skeleton-component'

export default function ModalDetectScreen() {
  const navigation = useNavigation()
  const audioService = useMemo(() => new AudioService(), [])
  const [modalVisible, setModalVisible] = useState(false)
  const [audio, setAudio] = useState<AudioDetect | null>(null)
  const [loading, setLoading] = useState(false)
  const { colors, theme } = useTheme()
  const { id } = useLocalSearchParams()
  enum databaseResult {
    DETECTED_ADM,
    DETECTED_USERS,
    UNDETECTED_USERS,
    UNDETERMINATED_USERS,
    UNDETECTED,
  }

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
        <Ionicons name="checkmark-circle" size={48} color={colors.positive} />
      )
    }

    return <Ionicons name="close-circle" size={48} color={colors.negative} />
  }

  const getDatabaseTextEntity = (audio: AudioDetect) => {
    const results = [
      `O áudio contém assédio moral baseado nos dados do Administrador`,
      `O áudio contém assédio moral baseado na opinião dos usuários`,
      `O áudio não contém assédio moral baseado na opinião dos usuários`,
      `A opinião dos usuários está empatada, não foi possível determinar se o áudio contém assédio moral`,
      '',
    ]

    const database = getDatabaseResult(audio)

    return results[database]
  }

  const getDatabaseIcon = (audio: AudioDetect) => {
    const database = getDatabaseResult(audio)

    if (
      database === databaseResult.UNDETECTED ||
      database === databaseResult.UNDETECTED_USERS
    ) {
      return <Ionicons name="close-circle" size={48} color={colors.negative} />
    }

    if (
      database === databaseResult.DETECTED_ADM ||
      database === databaseResult.DETECTED_USERS
    ) {
      return (
        <Ionicons name="checkmark-circle" size={48} color={colors.positive} />
      )
    }

    return <Ionicons name="help-circle" size={48} color={colors.warning} />
  }

  const getDatabaseResult = (audio: AudioDetect): databaseResult => {
    if (
      audio.databaseUserDetect &&
      audio.databaseUsersApprove &&
      audio.databaseUsersReject
    ) {
      if (
        audio.databaseUsersApprove.length >
        audio.databaseUsersReject.length
      ) {
        return databaseResult.DETECTED_USERS
      }

      if (
        audio.databaseUsersApprove.length <
        audio.databaseUsersReject.length
      ) {
        return databaseResult.UNDETECTED_USERS
      }

      return databaseResult.UNDETERMINATED_USERS
    }

    if (audio.databaseResult) {
      return databaseResult.DETECTED_ADM
    }

    return databaseResult.UNDETECTED
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
        <ThemedView style={styles.container}>
          <Pressable style={styles.btnClose} onPress={closeModal}>
            <Ionicons
              name="close"
              size={24}
              color={theme == ThemeEnum.Light ? 'black' : 'white'}
            />
          </Pressable>
          <ScrollView style={{ paddingHorizontal: 32, marginVertical: 16 }}>
            <View>
              <ThemedText type="subtitle">
                Resultado da detecção:{' '}
                {audio ? `#${audio.idDetection}` : 'buscando...'}
              </ThemedText>
              <View style={styles.btnPlayRecordSection}>
                <ThemedText style={{ fontWeight: 'bold' }}>
                  Texto gerado:
                </ThemedText>
                {audio && (
                  <Pressable
                    style={[
                      styles.btnPlayRecord,
                      { borderColor: colors.primary },
                    ]}
                    onPress={() => playSound(audio.recordingAudio)}
                  >
                    <Ionicons name="play" size={24} color={colors.primary} />
                  </Pressable>
                )}
              </View>
              {audio && (
                <ThemedText style={{ marginTop: 4 }}>
                  {audio.mainText}
                </ThemedText>
              )}
              {!audio && loading && (
                <Skeleton
                  containerStyle={{ marginTop: 8 }}
                  boneColor={theme === ThemeEnum.Light ? '#f0f0f0' : '#333'}
                  highlightColor={theme === ThemeEnum.Light ? '#fff' : '#444'}
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
            <View style={styles.resultsSection}>
              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/mistral-logo.png')}
                    style={{ width: 48, height: 48 }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
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
                <ThemedText style={{ marginTop: 16 }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>
                    Resposta:
                  </ThemedText>{' '}
                  {audio?.mistralMessage ?? 'não disponível'}
                </ThemedText>
              </View>
              <View  style={[styles.resultItem, { borderColor: colors.mutedStrong }]}>
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/cohere-logo.png')}
                    style={{ width: 48, height: 48 }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
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
                <ThemedText style={{ marginTop: 16 }}>
                  <ThemedText style={{ fontWeight: 'bold' }}>
                    Resposta:
                  </ThemedText>{' '}
                  {audio?.cohereMessage ?? 'não disponível'}
                </ThemedText>
              </View>
              <View  style={[styles.resultItem, { borderColor: colors.mutedStrong }]}>
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/database-logo.png')}
                    style={{ width: 48, height: 48 }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
                    Database
                  </ThemedText>
                  {audio && getDatabaseIcon(audio)}
                  {!audio && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                {audio && audio.databaseResult && (
                  <ThemedText style={{ marginTop: 16 }}>
                    {getDatabaseTextEntity(audio)}
                  </ThemedText>
                )}
                {audio && audio.databaseResult && audio.databaseUserDetect && (
                  <Pressable
                    style={styles.btnSavePhrase}
                    onPress={() =>
                      router.push(`/phrase/details/${audio.idDetection}`)
                    }
                  >
                    <ThemedText style={{ color: 'white' }}>
                      Ver detalhes
                    </ThemedText>
                  </Pressable>
                )}
                {audio && !audio.databaseResult && (
                  <Pressable
                    style={styles.btnSavePhrase}
                    onPress={() => router.push(`/phrase/${audio.idDetection}`)}
                  >
                    <ThemedText style={{ color: 'white' }}>
                      Salvar texto como assédio moral
                    </ThemedText>
                  </Pressable>
                )}
              </View>
              <View  style={[styles.resultItem, { borderColor: colors.mutedStrong }]}>
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/similarity-logo.png')}
                    style={{ width: 48, height: 48 }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
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
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    paddingTop: 32,
  },
  btnClose: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  btnPlayRecordSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  btnPlayRecord: {
    borderRadius: '100%',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  resultsSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  resultItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  resultItemTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultItemTitleTxt: {
    fontSize: 20,
    flex: 1,
    marginHorizontal: 16,
  },
  btnSavePhrase: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
