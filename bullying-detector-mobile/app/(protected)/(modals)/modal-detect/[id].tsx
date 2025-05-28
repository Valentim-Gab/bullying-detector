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
import { ScrollView } from 'react-native'
import { Audio } from 'expo-av'
import { useTheme } from '@/hooks/useTheme'
import { environment } from '@/environments/environment'
import { DetectionService } from '@/services/DetectionService'
import { DetectionData } from '@/interfaces/Detection'
import Skeleton from 'expo-skeleton-component'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'

export default function ModalDetectScreen() {
  const navigation = useNavigation()
  const detectionService = useMemo(() => new DetectionService(), [])
  const [modalVisible, setModalVisible] = useState(false)
  const [detection, setDetection] = useState<DetectionData | null>(null)
  const [loading, setLoading] = useState(false)
  const { colors, theme } = useTheme()
  const { id } = useLocalSearchParams()
  const [modalTextConfig, setModalTextConfig] = useState({
    visible: false,
    title: '',
    text: '',
  })

  enum databaseResult {
    DETECTED_ADM,
    DETECTED_USERS,
    UNDETECTED_USERS,
    UNDETERMINATED_USERS,
    UNDETECTED,
  }

  const fetchAudio = async (id: number) => {
    setLoading(true)

    const data = await detectionService.get(id)

    if (data) {
      setDetection(data)
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

  const getDatabaseTextEntity = (detection: DetectionData) => {
    const results = [
      `O áudio contém assédio moral baseado nos dados do Administrador`,
      `O áudio contém assédio moral baseado na opinião dos usuários`,
      `O áudio não contém assédio moral baseado na opinião dos usuários`,
      `A opinião dos usuários está empatada, não foi possível determinar se o áudio contém assédio moral`,
      '',
    ]

    const database = getDatabaseResult(detection)

    return results[database]
  }

  const getDatabaseIcon = (detection: DetectionData) => {
    const database = getDatabaseResult(detection)

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

  const getDatabaseResult = (detection: DetectionData): databaseResult => {
    if (
      detection.databaseUserDetect &&
      detection.databaseUsersApprove &&
      detection.databaseUsersReject
    ) {
      if (detection.databaseUsersApprove > detection.databaseUsersReject) {
        return databaseResult.DETECTED_USERS
      }

      if (detection.databaseUsersApprove < detection.databaseUsersReject) {
        return databaseResult.UNDETECTED_USERS
      }

      return databaseResult.UNDETERMINATED_USERS
    }

    if (detection.databaseResult) {
      return databaseResult.DETECTED_ADM
    }

    return databaseResult.UNDETECTED
  }

  async function playSound(filename: string) {
    const { sound: playbackObject } = await Audio.Sound.createAsync(
      {
        uri: `${environment.apiUrl}/audio/download/${filename}`,
      },
      { shouldPlay: true }
    )

    await playbackObject.playAsync()
  }

  const getDetectionCalculation = (detection: DetectionData | null) => {
    if (!detection) return ['0']

    const {
      mistralResult,
      cohereResult,
      deepseekResult,
      databaseResult = 0,
      similarityResult = 0,
    } = detection

    // Preparar os valores LLM
    const llmValues = [
      { key: 'mistral', value: mistralResult },
      { key: 'cohere', value: cohereResult },
      { key: 'deepseek', value: deepseekResult },
    ].filter((item) => item.value !== null)

    const llmKeys = llmValues.map((item) => item.key)
    const llmNums = llmValues.map((item) => item.value!) // não-null assert

    let formulaSymbol = ''
    let formulaNumeric = ''
    let llmAverage = 0

    if (llmNums.length > 0) {
      const sum = llmNums.reduce((acc, val) => acc + val, 0)
      llmAverage = sum / llmNums.length

      formulaSymbol += `(${llmKeys.join(' + ')})/${llmNums.length}`
      formulaNumeric += `(${llmNums.join(' + ')})/${llmNums.length}`
    }

    // Add database + similarity
    const partsSymbol = []
    const partsNumeric = []

    if (formulaSymbol) {
      partsSymbol.push(formulaSymbol)
      partsNumeric.push(formulaNumeric)
    }

    partsSymbol.push('database', 'similarity')
    partsNumeric.push(
      (databaseResult ?? 0).toString(),
      (similarityResult ?? 0).toString()
    )

    const total = llmAverage + (databaseResult ?? 0) + (similarityResult ?? 0)

    return [
      `${partsSymbol.join(' + ')} = ${total.toFixed(2)}`,
      `${partsNumeric.join(' + ')} = ${total.toFixed(2)}`,
    ]
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
              <ThemedText type="title">
                Detecção:{' '}
                {detection ? `#${detection.idDetection}` : 'buscando...'}
              </ThemedText>
              <View
                style={{
                  borderColor: colors.mutedStrong,
                  padding: 16,
                  paddingTop: 0,
                  borderWidth: 1,
                  borderRadius: 12,
                  marginTop: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ThemedText>Classificação final: </ThemedText>
                  {detection && detection.avaliation != null ? (
                    <View style={{ justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.avaliation >= 3
                                ? colors.negative
                                : colors.positive,
                            marginTop: 12,
                          },
                        ]}
                      >
                        {detection && detection.avaliation}
                        <ThemedText
                          type="small"
                          style={{ color: colors.mutedForeground }}
                        >
                          {' '}
                          / 5
                        </ThemedText>
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText>
                      <Ionicons
                        name="close-circle"
                        size={48}
                        color={colors.negative}
                      />
                    </ThemedText>
                  )}

                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>

                {detection && (
                  <View>
                    <View style={styles.sectionDetectionActions}>
                      <Pressable
                        style={{ alignItems: 'center' }}
                        onPress={() => {
                          setModalTextConfig({
                            visible: true,
                            title: 'Texto da detecção',
                            text: detection?.mainText ?? '-',
                          })
                        }}
                      >
                        <ThemedText
                          style={{
                            color: colors.secondaryLight,
                            fontWeight: 'semibold',
                            textAlign: 'center',
                          }}
                        >
                          Texto
                        </ThemedText>
                      </Pressable>

                      {detection.recordingAudio && (
                        <Pressable
                          style={[
                            styles.btnPlayRecord,
                            { borderColor: colors.primary },
                          ]}
                          onPress={() =>
                            detection.recordingAudio &&
                            playSound(detection.recordingAudio)
                          }
                        >
                          <Ionicons
                            name="play"
                            size={24}
                            color={colors.primary}
                          />
                        </Pressable>
                      )}

                      <Pressable
                        style={{ alignItems: 'center' }}
                        onPress={() => {
                          const calculation = getDetectionCalculation(detection)

                          setModalTextConfig({
                            visible: true,
                            title: 'Cálculo da detecção',
                            text: `${calculation[0]}\n\nValores numéricos:\n${calculation[1]}`,
                          })
                        }}
                      >
                        <ThemedText
                          style={{
                            color: colors.secondaryLight,
                            fontWeight: 'semibold',
                            textAlign: 'center',
                          }}
                        >
                          Cálculo
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                )}
                {!detection && loading && (
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
            </View>

            <View style={{ marginTop: 24 }}>
              <ThemedText type="subtitle">
                Classificações individuais
              </ThemedText>
            </View>

            <View style={styles.resultsSection}>
              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/mistral-logo.png')}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
                    Mistral AI
                  </ThemedText>
                  {detection && detection.mistralResult != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.mistralResult >= 3
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.mistralResult}
                        <ThemedText
                          type="small"
                          style={{ color: colors.mutedForeground }}
                        >
                          {' '}
                          / 5
                        </ThemedText>
                      </ThemedText>
                    </View>
                  ) : (
                    <Ionicons
                      name="close-circle"
                      size={48}
                      color={colors.negative}
                    />
                  )}

                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                {detection &&
                detection.mistralMessage &&
                detection.mistralResult != null ? (
                  <Pressable
                    style={{ marginTop: 8, alignItems: 'center' }}
                    onPress={() => {
                      setModalTextConfig({
                        visible: true,
                        title: 'Justificativa da Mistral AI',
                        text: detection?.mistralMessage ?? '-',
                      })
                    }}
                  >
                    <ThemedText
                      style={{
                        color: colors.secondaryLight,
                        fontWeight: 'semibold',
                        textAlign: 'center',
                      }}
                    >
                      Justificativa
                    </ThemedText>
                  </Pressable>
                ) : (
                  <View style={{ marginTop: 8, alignItems: 'center' }}>
                    <ThemedText style={{ textAlign: 'center' }}>
                      {detection?.mistralResult == null
                        ? 'Falha na detecção'
                        : detection?.mistralMessage ?? 'Não disponível'}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/cohere-logo.png')}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
                    Cohere AI
                  </ThemedText>
                  {detection && detection.cohereResult != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.cohereResult >= 3
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.cohereResult}
                        <ThemedText
                          type="small"
                          style={{ color: colors.mutedForeground }}
                        >
                          {' '}
                          / 5
                        </ThemedText>
                      </ThemedText>
                    </View>
                  ) : (
                    <Ionicons
                      name="close-circle"
                      size={48}
                      color={colors.negative}
                    />
                  )}
                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                {detection &&
                detection.cohereMessage &&
                detection.cohereResult != null ? (
                  <Pressable
                    style={{ marginTop: 8, alignItems: 'center' }}
                    onPress={() => {
                      setModalTextConfig({
                        visible: true,
                        title: 'Justificativa da Cohere AI',
                        text: detection?.cohereMessage ?? '-',
                      })
                    }}
                  >
                    <ThemedText
                      style={{
                        color: colors.secondaryLight,
                        fontWeight: 'semibold',
                        textAlign: 'center',
                      }}
                    >
                      Justificativa
                    </ThemedText>
                  </Pressable>
                ) : (
                  <View style={{ marginTop: 8, alignItems: 'center' }}>
                    <ThemedText style={{ textAlign: 'center' }}>
                      {detection?.cohereResult == null
                        ? 'Falha na detecção'
                        : detection?.cohereMessage ?? 'Não disponível'}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/deepseek-logo.png')}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
                    DeepSeek AI
                  </ThemedText>
                  {detection && detection.deepseekResult != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.deepseekResult >= 3
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.deepseekResult}
                        <ThemedText
                          type="small"
                          style={{ color: colors.mutedForeground }}
                        >
                          {' '}
                          / 5
                        </ThemedText>
                      </ThemedText>
                    </View>
                  ) : (
                    <Ionicons
                      name="close-circle"
                      size={48}
                      color={colors.negative}
                    />
                  )}
                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                {detection &&
                detection.deepseekMessage &&
                detection.deepseekResult != null ? (
                  <Pressable
                    style={{ marginTop: 8, alignItems: 'center' }}
                    onPress={() => {
                      setModalTextConfig({
                        visible: true,
                        title: 'Justificativa da DeepSeek AI',
                        text: detection?.deepseekMessage ?? '-',
                      })
                    }}
                  >
                    <ThemedText
                      style={{
                        color: colors.secondaryLight,
                        fontWeight: 'semibold',
                        textAlign: 'center',
                      }}
                    >
                      Justificativa
                    </ThemedText>
                  </Pressable>
                ) : (
                  <View style={{ marginTop: 8, alignItems: 'center' }}>
                    <ThemedText style={{ textAlign: 'center' }}>
                      {detection?.deepseekResult == null
                        ? 'Falha na detecção'
                        : detection?.deepseekMessage ?? 'Não disponível'}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View>
                <ThemedText style={{ textAlign: 'center', lineHeight: 12 }}>
                  <Ionicons name="add" size={16} />
                </ThemedText>
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/database-logo.png')}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
                    Database
                  </ThemedText>
                  {detection && detection.databaseResult != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.databaseResult > 0
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.databaseResult}
                        <ThemedText
                          type="small"
                          style={{ color: colors.mutedForeground }}
                        >
                          {' '}
                          / 0.5
                        </ThemedText>
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText>
                      <Ionicons
                        name="close-circle"
                        size={48}
                        color={colors.negative}
                      />
                    </ThemedText>
                  )}
                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                </View>
                {detection && detection.databaseResult == null && (
                  <ThemedText style={{ marginTop: 16 }}>
                    {getDatabaseTextEntity(detection)}
                  </ThemedText>
                )}
                {detection &&
                  detection.databaseResult != null &&
                  detection.databaseUserDetect && (
                    <Pressable
                      style={styles.btnSavePhrase}
                      onPress={() =>
                        router.push(`/phrase/details/${detection.idDetection}`)
                      }
                    >
                      <ThemedText style={{ color: colors.secondaryLight }}>
                        Ver detalhes
                      </ThemedText>
                    </Pressable>
                  )}
                {detection && !detection.databaseResult && (
                  <Pressable
                    style={styles.btnSavePhrase}
                    onPress={() =>
                      router.push(`/phrase/${detection.idDetection}`)
                    }
                  >
                    <ThemedText style={{ color: colors.secondaryLight }}>
                      Classificar conteúdo como ofensivo
                    </ThemedText>
                  </Pressable>
                )}
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/similarity-logo.png')}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                  <ThemedText style={styles.resultItemTitleTxt}>
                    Similaridade
                  </ThemedText>
                  {detection && detection.similarityResult != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.similarityResult > 0
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.similarityResult}
                        <ThemedText
                          type="small"
                          style={{ color: colors.mutedForeground }}
                        >
                          {' '}
                          / 0.5
                        </ThemedText>
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText>
                      <Ionicons
                        name="close-circle"
                        size={48}
                        color={colors.negative}
                      />
                    </ThemedText>
                  )}
                  {!detection && loading && (
                    <ActivityIndicator
                      color={Colors.light.primary}
                      size="large"
                    />
                  )}
                  {!detection && loading && (
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

      <Modal
        visible={modalTextConfig.visible}
        animationType="slide"
        transparent={true}
      >
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
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              {modalTextConfig.title}
            </ThemedText>
            <ScrollView>
              <ThemedText>{modalTextConfig.text}</ThemedText>
            </ScrollView>
            <ButtonPrimary
              title="Fechar"
              dense
              style={{ marginTop: 24 }}
              onPress={() =>
                setModalTextConfig({
                  visible: false,
                  title: '',
                  text: '',
                })
              }
            />
          </ThemedView>
        </View>
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
  sectionDetectionActions: {
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
  resultValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 'bold',
  },
  btnSavePhrase: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
