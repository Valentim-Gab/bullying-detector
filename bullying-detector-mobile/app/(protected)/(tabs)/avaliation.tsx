import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native'
import React from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AvaliationService } from '@/services/AvaliationService'

export default function AvaliationScreen() {
  const { colors } = useTheme()
  const queryClient = useQueryClient()
  const avaliationService = new AvaliationService()

  const { data: avaliations, isLoading } = useQuery({
    queryKey: ['get_avaliations'],
    queryFn: () => avaliationService.getAll(),
    retry: false,
  })

  // Função de refresh
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
            <ThemedText>{item.mainText}</ThemedText>
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
        // Cabeçalho para incluir a parte fixa (UFSM e subtítulo)
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
    justifyContent: 'center',
  },
})
