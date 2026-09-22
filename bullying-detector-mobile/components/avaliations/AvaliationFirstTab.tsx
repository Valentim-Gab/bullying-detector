import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import InputPrimary from '@/components/inputs/InputPrimary'
import { ThemedText } from '@/components/ThemedText'
import { useTheme } from '@/hooks/useTheme'
import { Avaliation } from '@/interfaces/Avaliation'
import { Pagination } from '@/interfaces/Pagintation'
import { InfiniteData } from '@tanstack/react-query'
import { memo } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'

const AvaliationFirstTab = memo(function FirstRoute({
  avaliations,
  isLoading,
  isFetchingNextPage,
  onRefresh,
  searchText,
  setSearchText,
  onOpen,
  onDetect,
  onLoadMore,
}: {
  avaliations: InfiniteData<Pagination<Avaliation>> | null
  isLoading: boolean
  isFetchingNextPage: boolean
  onRefresh: () => void
  searchText: string
  setSearchText: (t: string) => void
  onOpen: (visible: boolean, text?: string, title?: string) => void
  onDetect: (item: Avaliation) => void
  onLoadMore: () => void
}) {
  const { colors } = useTheme()
  const logoMarkWhite = require('@/assets/images/logos/logomark-white.png')

  return (
    <FlatList
      data={
        avaliations?.pages.flatMap((page) =>
          page && page.data ? page.data : []
        ) ?? []
      }
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
      ListFooterComponent={
        avaliations &&
        avaliations.pages.length > 0 &&
        avaliations.pages[avaliations.pages.length - 1].page <
          avaliations.pages[avaliations.pages.length - 1].lastPage ? (
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            {isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <ButtonPrimary
                title="Carregar mais"
                dense
                flat
                color="primary"
                onPress={onLoadMore}
              />
            )}
          </View>
        ) : null
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

export default AvaliationFirstTab

const styles = StyleSheet.create({
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  accessText: {
    flex: 1,
  },
  listItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
})
