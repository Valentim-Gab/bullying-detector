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
import React, { useState } from 'react'
import { DetectionService } from '@/services/DetectionService'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { RFValue } from 'react-native-responsive-fontsize'
import { Detection } from '@/interfaces/Detection'
import { Avaliation } from '@/interfaces/Avaliation'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import Loading from '@/components/Loading'
import Toast from 'react-native-toast-message'

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
  const logoMarkWhite = require('@/assets/images/logos/logomark-white.png')

  const [modalTextConfig, setModalTextConfig] = useState({
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

  const FirstRoute = () => (
    <FlatList
      data={avaliations ?? []}
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.listItem,
            { borderColor: colors.mutedStrong },
            index === 0 && { borderTopWidth: 1 },
          ]}
        >
          <ThemedText
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ flex: 1 }}
          >
            {item.mainText}
          </ThemedText>

          <ButtonPrimary
            icon={
              <Image
                source={logoMarkWhite}
                alt="Logo"
                style={{ width: 24, height: 24 }}
              />
            }
            round
            mini
            noShadow
            onPress={() => handleDetect(item)}
          />
        </View>
      )}
      keyExtractor={(item) => `${item.idAvaliation}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
      ListEmptyComponent={() => (
        <ThemedText>
          {isLoading
            ? 'Carregando avaliações...'
            : 'Nenhuma avaliação encontrada'}
        </ThemedText>
      )}
      ListHeaderComponent={
        <View style={styles.titleSection}>
          <ThemedText type="subtitle">
            Selecione uma avaliação para detectar possíveis ofensas
          </ThemedText>
        </View>
      }
    />
  )

  const SecondRoute = () => (
    <FlatList
      data={detectionsUFSM ?? []}
      renderItem={({ item, index }) => (
        <Pressable
          key={item.idDetection}
          onPress={() => {
            router.push(`/modal-detect/${item.idDetection}`)
          }}
          style={[styles.btnAccess, { borderColor: colors.mutedStrong }]}
        >
          <ThemedText style={styles.btnAccessText}>
            {item.mainText.length > 50
              ? `${item.mainText.substring(0, 50)}...`
              : item.mainText}
          </ThemedText>
          <View style={styles.btnAccessIconSection}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>
        </Pressable>
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
        <View style={styles.titleSection}>
          <ThemedText type="subtitle">
            Selecione uma avaliação para visualizar a detecção
          </ThemedText>
        </View>
      }
    />
  )

  const renderScene = SceneMap({
    avaliations: FirstRoute,
    detections: SecondRoute,
  })

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
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  titleSection: {
    gap: 8,
    paddingTop: 32,
    paddingBottom: 16,
  },
  listItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
})
