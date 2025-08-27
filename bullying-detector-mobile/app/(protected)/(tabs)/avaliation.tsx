import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/hooks/useTheme'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AvaliationService } from '@/services/AvaliationService'
import {
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
  Image,
  Dimensions,
  Pressable,
  Platform,
  ToastAndroid,
} from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { DetectionService } from '@/services/DetectionService'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { RFValue } from 'react-native-responsive-fontsize'
import { Detection, DetectionData } from '@/interfaces/Detection'
import { Avaliation } from '@/interfaces/Avaliation'
import { debounce } from 'lodash'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import Loading from '@/components/Loading'
import Toast from 'react-native-toast-message'
import ModalText from '@/components/modals/ModalText'
import InputPrimary from '@/components/inputs/InputPrimary'

export default function AvaliationScreen() {
  const [index, setIndex] = useState(0)
  const [loadingDetect, setLoadingDetect] = useState(false)
  const [routes] = useState([
    { key: 'avaliations', title: 'Avaliações' },
    { key: 'detections', title: 'Detecções' },
  ])
  const { colors } = useTheme()
  const queryClient = useQueryClient()
  const avaliationService = new AvaliationService()
  const detectionService = new DetectionService()
  const [searchText, setSearchText] = useState<string>('')
  const [filteredAvaliations, setFilteredAvaliations] = useState<Avaliation[]>(
    []
  )

  const [modalTextConfig, setModalTextConfig] = useState<{
    visible: boolean
    title: string
    text: string
  }>({
    visible: false,
    title: '',
    text: '',
  })

  const { data: avaliations, isLoading } = useQuery({
    queryKey: ['get_avaliations'],
    queryFn: () => avaliationService.getAll(),
    retry: false,
  })

  const { data: detectionsUFSM, isLoading: isLoadingDetections } = useQuery({
    queryKey: ['get_detections_ufsm'],
    queryFn: () => detectionService.getAll('UFSM'),
    retry: false,
  })

  useEffect(() => {
    if (!searchText || !avaliations) {
      setFilteredAvaliations(avaliations ?? [])
      return
    }

    const debouncedFilter = debounce((text: string) => {
      setFilteredAvaliations(
        avaliations.filter((avaliation) =>
          (avaliation.mainText ?? '').toLowerCase().includes(text.toLowerCase())
        )
      )
    }, 500)

    debouncedFilter(searchText)

    return () => {
      debouncedFilter.cancel()
    }
  }, [avaliations, searchText])

  const handleDetect = async (avaliation: Avaliation) => {
    if (avaliation.idAvaliation == null) {
      return
    }

    try {
      const existingDetection = await detectionService.findByExternal(
        avaliation.idAvaliation,
        'UFSM'
      )

      if (existingDetection) {
        setIndex(1)
        router.push(`/modal-detect/${existingDetection.idDetection}`)

        if (Platform.OS === 'android')
          ToastAndroid.show('Já foi avaliado anteriormente', ToastAndroid.SHORT)

        return
      }
    } catch (error) {
      console.error('Erro ao verificar detecção existente:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao verificar detecção existente',
        text1Style: { fontSize: RFValue(14) },
      })

      return
    }

    const detectionData: Detection = {
      mainText: avaliation.mainText,
      context: 'Universidade Federal - Avaliação de aulas e professores',
      externalModule: 'UFSM',
      externalId: avaliation.idAvaliation,
    }

    detectMutation.mutate(detectionData)
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['get_avaliations'] })
  }

  const handleRefreshUFSM = async () => {
    await queryClient.invalidateQueries({ queryKey: ['get_detections_ufsm'] })
  }

  const handleModalText = (visible: boolean, text = '', title = '') => {
    setModalTextConfig({ visible, text, title })
  }

  const detectMutation = useMutation({
    mutationKey: ['detect'],
    mutationFn: (detection: Detection) => detectionService.create(detection),
    onMutate: () => {
      setLoadingDetect(true)
    },
    onSettled: () => {
      setLoadingDetect(false)
    },
    onSuccess: (data: Detection) => {
      handleRefreshUFSM()
      setIndex(1)
      router.push(`/modal-detect/${data.idDetection}`)

      if (Platform.OS === 'android')
        ToastAndroid.show('Detecção realizada', ToastAndroid.SHORT)
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: error.message,
        text1Style: { fontSize: RFValue(14) },
      })
    },
  })

  const renderScene = useCallback(
    ({ route }: { route: { key: string; title?: string } }) => {
      switch (route.key) {
        case 'avaliations':
          return (
            <FirstRoute
              data={filteredAvaliations}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              searchText={searchText}
              setSearchText={setSearchText}
              onOpen={handleModalText}
              onDetect={handleDetect}
            />
          )
        case 'detections':
          return (
            <SecondRoute
              detectionsUFSM={detectionsUFSM}
              isLoadingDetections={isLoadingDetections}
              handleRefreshUFSM={handleRefreshUFSM}
              handleModalText={handleModalText}
            />
          )
        default:
          return null
      }
    },
    [filteredAvaliations, isLoading, handleRefresh, searchText]
  )

  return (
    <ThemedSafeView style={styles.container}>
      <ThemedText type="title">UFSM</ThemedText>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        style={{ marginTop: 16 }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: colors.text }}
            style={{ backgroundColor: colors.background }}
            activeColor={colors.secondaryLight}
            inactiveColor="gray"
          />
        )}
      />
      <Loading visible={loadingDetect} />
      <ModalText
        visible={modalTextConfig.visible}
        title={modalTextConfig.title}
        text={modalTextConfig.text}
        handleClose={() => handleModalText(false)}
      />
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  listItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  access: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.light.mutedStrong,
  },
  accessText: {
    flex: 1,
  },
  btnAccessIconSection: {
    marginLeft: 8,
    padding: 4,
  },
})

const FirstRoute = React.memo(function FirstRoute({
  data,
  isLoading,
  onRefresh,
  searchText,
  setSearchText,
  onOpen,
  onDetect,
}: {
  data: Avaliation[]
  isLoading: boolean
  onRefresh: () => void
  searchText: string
  setSearchText: (t: string) => void
  onOpen: (visible: boolean, text?: string, title?: string) => void
  onDetect: (item: Avaliation) => void
}) {
  const { colors } = useTheme()
  const logoMarkWhite = require('@/assets/images/logos/logomark-white.png')

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item, index) => String(item?.idAvaliation ?? index)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      ListEmptyComponent={() => (
        <ThemedText>
          {isLoading
            ? 'Carregando avaliações...'
            : 'Nenhuma avaliação encontrada'}
        </ThemedText>
      )}
      ListHeaderComponent={
        <View style={{ marginTop: 16 }}>
          <InputPrimary
            value={searchText}
            placeholder="Buscar avaliações..."
            onChangeText={setSearchText}
          />
          <View style={styles.titleSection}>
            <ThemedText
              style={{ fontSize: RFValue(14), color: colors.mutedForeground }}
            >
              Avaliação
            </ThemedText>
            <ThemedText
              style={{ fontSize: RFValue(14), color: colors.mutedForeground }}
            >
              Detectar
            </ThemedText>
          </View>
        </View>
      }
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.listItem,
            { borderColor: colors.mutedStrong },
            index === 0 && { borderTopWidth: 1 },
          ]}
        >
          <Pressable
            style={{ width: 288 }}
            onPress={() => onOpen(true, item.mainText, 'Avaliação de aluno')}
          >
            <ThemedText
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.accessText}
            >
              {item.mainText}
            </ThemedText>
          </Pressable>

          <ButtonPrimary
            icon={
              <Image
                source={logoMarkWhite}
                alt="Logo"
                style={{ width: 24, height: 24 }}
              />
            }
            round
            noShadow
            mini
            onPress={() => onDetect(item)}
          />
        </View>
      )}
    />
  )
})

const SecondRoute = React.memo(function SecondRoute({
  detectionsUFSM,
  isLoadingDetections,
  handleRefreshUFSM,
  handleModalText,
}: {
  detectionsUFSM?: DetectionData[] | null
  isLoadingDetections: boolean
  handleRefreshUFSM: () => void
  handleModalText: (visible: boolean, text?: string, title?: string) => void
}) {
  const { colors } = useTheme()

  return (
    <FlatList
      data={detectionsUFSM ?? []}
      renderItem={({ item, index }) => (
        <View
          key={item.idDetection}
          style={[styles.access, { borderColor: colors.mutedStrong }]}
        >
          <Pressable
            style={{ width: 258 }}
            onPress={() =>
              handleModalText(true, item.mainText, 'Detecção de Assédio')
            }
          >
            <ThemedText
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.accessText}
            >
              {item.mainText}
            </ThemedText>
          </Pressable>
          <Pressable
            style={{
              padding: 8,
              borderRadius: '100%',
              width: 40,
            }}
            onPress={() => {
              router.push(`/modal-detect/${item.idDetection}`)
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.light.primary}
            />
          </Pressable>
        </View>
      )}
      keyExtractor={(item) => `${item.idDetection}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoadingDetections}
          onRefresh={handleRefreshUFSM}
        />
      }
      ListEmptyComponent={() => (
        <ThemedText>Nenhuma detecção encontrada</ThemedText>
      )}
      ListHeaderComponent={
        <View style={{ marginTop: 16 }}>
          <View style={styles.titleSection}>
            <ThemedText type="subtitle">
              Selecione uma avaliação para visualizar a detecção
            </ThemedText>
          </View>
        </View>
      }
    />
  )
})
