import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/hooks/useTheme'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { AvaliationService } from '@/services/AvaliationService'
import { StyleSheet, Dimensions, Platform, ToastAndroid } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { DetectionService } from '@/services/DetectionService'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { router } from 'expo-router'
import { RFValue } from 'react-native-responsive-fontsize'
import { Detection } from '@/interfaces/Detection'
import { Avaliation } from '@/interfaces/Avaliation'
import { debounce } from 'lodash'
import { Pagination } from '@/interfaces/Pagintation'
import Loading from '@/components/Loading'
import Toast from 'react-native-toast-message'
import ModalText from '@/components/modals/ModalText'
import AvaliationFirstTab from '@/components/avaliations/AvaliationFirstTab'
import AvaliationSecondTab from '@/components/avaliations/AvaliationSecondTab'
import { environment } from '@/environments/environment'

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
  const [debouncedSearch, setDebouncedSearch] = useState(searchText)
  const [perPage] = useState(10)

  const [modalTextConfig, setModalTextConfig] = useState<{
    visible: boolean
    title: string
    text: string
  }>({
    visible: false,
    title: '',
    text: '',
  })

  useEffect(() => {
    const handler = debounce((text: string) => {
      setDebouncedSearch(text)
    }, 500)

    handler(searchText)

    return () => {
      handler.cancel()
    }
  }, [searchText])

  const {
    data: avaliations,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['get_avaliations', perPage, debouncedSearch],
    queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
      const result = await avaliationService.getAllPagination(
        Number(pageParam),
        perPage,
        debouncedSearch,
        false
      )

      if (!result) {
        return {
          data: [],
          page: Number(pageParam),
          lastPage: Number(pageParam),
          perPage,
          total: 0,
        }
      }

      return result
    },
    getNextPageParam: (lastPage: Pagination<Avaliation>) => {
      if (lastPage.page < lastPage.lastPage) {
        return lastPage.page + 1
      }

      return undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    retry: false,
  })

  const { data: detectionsUFSM, isLoading: isLoadingDetections } = useQuery({
    queryKey: ['get_detections_ufsm'],
    queryFn: () => detectionService.getAll('UFSM'),
    retry: false,
  })

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
      external: {
        module: 'UFSM',
        id: avaliation.idAvaliation,
      },
      hook: {
        hookMethod: 'PATCH',
        hookUrl: `${environment.apiUrl}/avaliation/detection`,
        hookIdBodyKey: 'id',
        hookAvaliationBodyKey: 'avaliation',
      },
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

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
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
      handleRefresh()
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
            <AvaliationFirstTab
              avaliations={avaliations ?? null}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              onRefresh={handleRefresh}
              searchText={searchText}
              setSearchText={setSearchText}
              onOpen={handleModalText}
              onDetect={handleDetect}
              onLoadMore={handleLoadMore}
            />
          )
        case 'detections':
          return (
            <AvaliationSecondTab
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
    [avaliations, isLoading, handleRefresh, searchText]
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

  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccessIconSection: {
    marginLeft: 8,
    padding: 4,
  },
})
