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
  Modal,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native'
import React, { useState } from 'react'
import { DetectionService } from '@/services/DetectionService'
import { ThemedView } from '@/components/ThemedView'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Colors } from 'react-native/Libraries/NewAppScreen'

export default function AvaliationScreen() {
  const [index, setIndex] = useState(0)
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

  const handleDetect = (text: string) => {
    // detectMutation.mutateAsync(text)
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['get_avaliations'] })
  }

  const handleRefreshUFSM = async () => {
    await queryClient.invalidateQueries({ queryKey: ['get_detections_ufsm'] })
  }

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
                style={{ width: 38, height: 38 }}
              />
            }
            round
            onPress={() => handleDetect(item.mainText)}
          />
        </View>
      )}
      keyExtractor={(item) => `${item.idAvaliation}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
      ListEmptyComponent={() => (
        <ThemedText>Nenhuma avaliação encontrada</ThemedText>
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
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
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
