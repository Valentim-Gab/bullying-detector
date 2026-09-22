import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/hooks/useTheme'
import { DetectionData } from '@/interfaces/Detection'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { memo } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'

const AvaliationSecondTab = memo(function SecondRoute({
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
            <View>
              <ThemedText
                style={[
                  styles.resultValue,
                  {
                    color:
                      item.finalClassification >= 3
                        ? colors.negative
                        : item.finalClassification >= 1
                        ? colors.warning
                        : colors.positive,
                  },
                ]}
              >
                {item && item.finalClassification.toFixed(2)}
                <ThemedText
                  type="small"
                  style={{ color: colors.mutedForeground }}
                >
                  {' '}
                  / 5
                </ThemedText>
              </ThemedText>
            </View>
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
              borderRadius: '100%',
              width: 40,
              height: 40,
              borderWidth: 2,
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: colors.primary,
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

export default AvaliationSecondTab

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
  resultValue: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 'bold',
  },
})
