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
  Text,
} from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { Colors } from '@/constants/Colors'
import { useEffect, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { Audio } from 'expo-av'
import { useTheme } from '@/hooks/useTheme'
import { environment } from '@/environments/environment'
import { DetectionService } from '@/services/DetectionService'
import { DetectionData } from '@/interfaces/Detection'
import { useMutation } from '@tanstack/react-query'
import { Vote } from '@/interfaces/Vote'
import { VoteService } from '@/services/VoteService'
import { RFValue } from 'react-native-responsive-fontsize'
import Skeleton from 'expo-skeleton-component'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import Toast from 'react-native-toast-message'
import { AiNameEnum } from '@/enums/AiEnum'

export default function ModalDetectScreen() {
  const navigation = useNavigation()
  const detectionService = useMemo(() => new DetectionService(), [])
  const voteService = useMemo(() => new VoteService(), [])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDatabase, setModalDatabase] = useState(false)
  const [selectedClassification, setSelectedClassification] = useState<
    number | null
  >(null)
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

  const fetchDetection = async (id: number) => {
    try {
      setLoading(true)

      const data = await detectionService.find(id)

      if (data) {
        setDetection(data)
      }
    } catch (error) {
      console.error('Erro ao buscar detecção:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setModalVisible(true)
      fetchDetection(Number(id))
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

  const playSound = async (filename: string | null) => {
    if (!filename) {
      return
    }

    try {
      const { sound: playbackObject } = await Audio.Sound.createAsync(
        {
          uri: `${environment.apiUrl}/detection/download/${filename}`,
        },
        { shouldPlay: true },
      )

      await playbackObject.playAsync()
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
    }
  }

  const getDetectionCalculation = (detection: DetectionData | null) => {
    if (!detection) {
      return {
        calculationKeys: 'Cálculo não encontrado',
        calculationValues: '0',
      }
    }

    const {
      detectorAi1Classification: ai1Result,
      detectorAi2Classification: ai2Result,
      detectorAi3Classification: ai3Result,
      detectorCollaborativeClassification: collaborativeResult,
      detectorCollaborativeUserDetect,
    } = detection

    // Avaliação colaborativa possui precedência
    if (detectorCollaborativeUserDetect) {
      const value = collaborativeResult ?? 0

      return {
        calculationKeys: `Colaborativo = ${value.toFixed(2)}`,
        calculationValues: `${value.toFixed(2)} = ${value.toFixed(2)}`,
      }
    }

    const llmValues = [
      { key: detection.detectorAi1Name ?? null, value: ai1Result },
      { key: detection.detectorAi2Name ?? null, value: ai2Result },
      { key: detection.detectorAi3Name ?? null, value: ai3Result },
    ].filter((item) => item.value !== null)

    const llmKeys = llmValues.map((item) => item.key)
    const llmNums = llmValues.map((item) => item.value ?? 0)

    if (llmNums.length > 0) {
      const sum = llmNums.reduce((acc, val) => acc + val, 0)
      const llmAverage = sum / llmNums.length

      const formulaSymbol = `(${llmKeys.join(' + ')})/${llmNums.length}`
      const formulaNumeric = `(${llmNums.join(' + ')})/${llmNums.length}`

      return {
        calculationKeys: `${formulaSymbol} = ${llmAverage.toFixed(2)}`,
        calculationValues: `${formulaNumeric} = ${llmAverage.toFixed(2)}`,
      }
    }

    return {
      calculationKeys: 'Nenhuma classificação disponível',
      calculationValues: '0',
    }
  }

  const handleModalDatabase = (value: boolean) => {
    setModalDatabase(value)
  }

  const vote = (voteClassification: number) => {
    const payload: Vote = {
      detectionId: Number(id),
      voteClassification: voteClassification,
    }

    voteMutation.mutate(payload)
  }

  const voteMutation = useMutation({
    mutationKey: ['upsert_vote'],
    mutationFn: (payload: Vote) => voteService.upsert(payload),
    onSuccess: () => {
      setModalDatabase(false)
      fetchDetection(Number(id))
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: error.message,
        text1Style: { fontSize: RFValue(14) },
      })
    },
  })

  const getAiLogoUrl = (aiName: AiNameEnum | null) => {
    switch (aiName) {
      case AiNameEnum.MISTRAL:
        return require('@/assets/images/mistral-logo.png')
      case AiNameEnum.COHERE:
        return require('@/assets/images/cohere-logo.png')
      case AiNameEnum.GEMINI:
        return require('@/assets/images/gemini-logo.png')
      case AiNameEnum.DEEP_SEEK:
        return require('@/assets/images/deepseek-logo.png')
      default:
        return require('@/assets/images/fallback-ia-logo.png')
    }
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
          <ScrollView style={{ paddingHorizontal: 24, marginVertical: 16 }}>
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
                  {detection && detection.finalClassification != null ? (
                    <View style={{ justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.finalClassification >= 3
                                ? colors.negative
                                : detection.finalClassification >= 1
                                  ? colors.warning
                                  : colors.positive,
                            marginTop: 12,
                          },
                        ]}
                      >
                        {detection && detection.finalClassification.toFixed(2)}
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
                        size={32}
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
                          onPress={() => playSound(detection.recordingAudio)}
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
                          const { calculationKeys, calculationValues } =
                            getDetectionCalculation(detection)

                          setModalTextConfig({
                            visible: true,
                            title: 'Cálculo da detecção',
                            text: `${calculationKeys}\n\nValores numéricos:\n${calculationValues}\n\nLimite: 5`,
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
              <ThemedText type="subtitle">Detectores</ThemedText>
            </View>

            <View style={styles.resultsSection}>
              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={getAiLogoUrl(detection?.detectorAi1Name ?? null)}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                  <View style={styles.resultItemTextSection}>
                    <ThemedText style={styles.resultItemTitleTxt}>
                      {detection?.detectorAi1Name || 'Desconhecido'}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.resultItemSubtitleTxt,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Detector por AI - 1º
                    </ThemedText>
                  </View>
                  {detection && detection.detectorAi1Classification != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.detectorAi1Classification >= 3
                                ? colors.negative
                                : detection.detectorAi1Classification >= 1
                                  ? colors.warning
                                  : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.detectorAi1Classification}
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
                      size={32}
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
                detection.detectorAi1Message &&
                detection.detectorAi1Classification != null ? (
                  <Pressable
                    style={{ marginTop: 8, alignItems: 'center' }}
                    onPress={() => {
                      setModalTextConfig({
                        visible: true,
                        title: `Justificativa: ${detection.detectorAi1Name}`,
                        text: detection?.detectorAi1Message ?? '-',
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
                      {detection?.detectorAi1Classification == null
                        ? 'Falha na detecção'
                        : (detection?.detectorAi1Message ?? 'Não disponível')}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={getAiLogoUrl(detection?.detectorAi2Name ?? null)}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                  <View style={styles.resultItemTextSection}>
                    <ThemedText style={styles.resultItemTitleTxt}>
                      {detection?.detectorAi2Name || 'Desconhecido'}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.resultItemSubtitleTxt,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Detector por AI - 2º
                    </ThemedText>
                  </View>
                  {detection && detection.detectorAi2Classification != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.detectorAi2Classification >= 3
                                ? colors.negative
                                : detection.detectorAi2Classification >= 1
                                  ? colors.warning
                                  : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.detectorAi2Classification}
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
                      size={32}
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
                detection.detectorAi2Message &&
                detection.detectorAi2Classification != null ? (
                  <Pressable
                    style={{ marginTop: 8, alignItems: 'center' }}
                    onPress={() => {
                      setModalTextConfig({
                        visible: true,
                        title: `Justificativa: ${detection.detectorAi2Name}`,
                        text: detection?.detectorAi2Message ?? '-',
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
                      {detection?.detectorAi2Classification == null
                        ? 'Falha na detecção'
                        : (detection?.detectorAi2Message ?? 'Não disponível')}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={getAiLogoUrl(detection?.detectorAi3Name ?? null)}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                  <View style={styles.resultItemTextSection}>
                    <ThemedText style={styles.resultItemTitleTxt}>
                      {detection?.detectorAi3Name || 'Desconhecido'}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.resultItemSubtitleTxt,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Detector por AI - 3º
                    </ThemedText>
                  </View>
                  {detection && detection.detectorAi3Classification != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.detectorAi3Classification >= 3
                                ? colors.negative
                                : detection.detectorAi3Classification >= 1
                                  ? colors.warning
                                  : colors.positive,
                          },
                        ]}
                      >
                        {detection && detection.detectorAi3Classification}
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
                      size={32}
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
                detection.detectorAi3Message &&
                detection.detectorAi3Classification != null ? (
                  <Pressable
                    style={{ marginTop: 8, alignItems: 'center' }}
                    onPress={() => {
                      setModalTextConfig({
                        visible: true,
                        title: `Justificativa: ${detection.detectorAi3Name}`,
                        text: detection?.detectorAi3Message ?? '-',
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
                      {detection?.detectorAi3Classification == null
                        ? 'Falha na detecção'
                        : (detection?.detectorAi3Message ?? 'Não disponível')}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/collaborative-logo.png')}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                  <View style={styles.resultItemTextSection}>
                    <ThemedText style={styles.resultItemTitleTxt}>
                      Colaborativo
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.resultItemSubtitleTxt,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Usuários e Administrador
                    </ThemedText>
                  </View>
                  {detection &&
                  detection.detectorCollaborativeClassification != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.detectorCollaborativeClassification > 0
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection &&
                          detection.detectorCollaborativeClassification.toFixed(
                            1,
                          )}
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
                        size={32}
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
                <Pressable
                  style={styles.btnSavePhrase}
                  onPress={() => handleModalDatabase(true)}
                >
                  <ThemedText style={{ color: colors.secondaryLight }}>
                    Classificar conteúdo
                  </ThemedText>
                </Pressable>
              </View>

              <View
                style={[styles.resultItem, { borderColor: colors.mutedStrong }]}
              >
                <View style={styles.resultItemTitleSection}>
                  <Image
                    source={require('@/assets/images/similarity-logo.png')}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                  <View style={styles.resultItemTextSection}>
                    <ThemedText style={styles.resultItemTitleTxt}>
                      Similaridade
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.resultItemSubtitleTxt,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Detector por Similaridade
                    </ThemedText>
                  </View>
                  {detection &&
                  detection.detectorSimilarityClassification != null ? (
                    <View style={{ height: 48, justifyContent: 'flex-end' }}>
                      <ThemedText
                        style={[
                          styles.resultValue,
                          {
                            color:
                              detection.detectorSimilarityClassification > 0
                                ? colors.negative
                                : colors.positive,
                          },
                        ]}
                      >
                        {detection &&
                          detection.detectorSimilarityClassification.toFixed(1)}
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
                        size={32}
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
        animationType="fade"
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

      <Modal visible={modalDatabase} animationType="fade" transparent>
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
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.mutedStrong,
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              Classificar conteúdo
            </ThemedText>

            <ThemedText style={{ marginBottom: 20 }}>
              Avalie o nível de ofensividade do texto em uma escala de 0 a 5.
            </ThemedText>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  style={[
                    styles.btnClassification,
                    {
                      backgroundColor: (() => {
                        if (
                          selectedClassification == null ||
                          selectedClassification !== value
                        ) {
                          return colors.mutedStrong
                        }

                        if (selectedClassification < 1) {
                          return colors.positive
                        }

                        if (selectedClassification < 3) {
                          return colors.warning
                        }

                        return colors.negative
                      })(),
                    },
                  ]}
                  onPress={() => setSelectedClassification(value)}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}
                  >
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <ThemedText>Inofensivo</ThemedText>
              <ThemedText>Ofensivo</ThemedText>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 24,
              }}
            >
              <ButtonPrimary
                title="Cancelar"
                dense
                outline
                onPress={() => {
                  setModalDatabase(false)
                  setSelectedClassification(null)
                }}
              />

              <ButtonPrimary
                title="Confirmar"
                dense
                disabled={selectedClassification === null}
                onPress={() => {
                  if (selectedClassification !== null) {
                    vote(selectedClassification)
                  }
                }}
              />
            </View>
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
    justifyContent: 'center',
  },
  resultItemTitleSection: {
    flexDirection: 'row',
  },
  resultItemTextSection: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 16,
  },
  resultItemTitleTxt: {
    fontSize: 20,
    lineHeight: 20,
    flex: 1,
  },
  resultItemSubtitleTxt: {
    fontSize: 12,
    flex: 1,
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
  btnVote: {
    height: 200,
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnClassification: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
