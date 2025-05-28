import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/hooks/useTheme'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AvaliationService } from '@/services/AvaliationService'
import { FlatList, StyleSheet, View, RefreshControl, Image } from 'react-native'
import React from 'react'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import { AudioService } from '@/services/DetectionService'

export default function AvaliationScreen() {
  const { colors } = useTheme()
  const queryClient = useQueryClient()
  const avaliationService = new AvaliationService()
  const audioService = new AudioService()
  const logoMarkWhite = require('@/assets/images/logos/logomark-white.png')

  const { data: avaliations, isLoading } = useQuery({
    queryKey: ['get_avaliations'],
    queryFn: () => avaliationService.getAll(),
    retry: false,
  })

  const detectMutation = useMutation({
    mutationKey: ['detect_audio'],
    mutationFn: (text: string) => audioService.detectText(text),
  })

  const handleDetect = (text: string) => {
    detectMutation.mutateAsync(text)
  }

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['get_avaliations'] })
  }

  return (
    <ThemedSafeView style={styles.container}>
      <FlatList
        data={avaliations ?? []}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.listItem,
              { borderColor: colors.mutedStrong },
              index == 0 && { borderTopWidth: 1 },
            ]}
          >
            <ThemedText style={{ flex: 1 }}>{item.mainText}</ThemedText>
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
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <ThemedText>Nenhuma avaliação encontrada</ThemedText>
        )}
        ListHeaderComponent={
          <View style={styles.titleSection}>
            <ThemedText type="title">UFSM</ThemedText>
            <ThemedText>Verifique as avaliações dos alunos</ThemedText>
            <ThemedText type="subtitle" style={{ marginTop: 16 }}>
              Avaliações:
            </ThemedText>
          </View>
        }
      />
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
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
})
