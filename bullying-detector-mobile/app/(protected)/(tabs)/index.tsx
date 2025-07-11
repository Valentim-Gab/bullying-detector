import { Image, StyleSheet, View, ScrollView } from 'react-native'
import { HelloWave } from '@/components/HelloWave'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { ThemeEnum } from '@/enums/ThemeEnum'
import React from 'react'

export default function HomeScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <ThemedView style={styles.container}>
      <View style={styles.viewImage}>
        <Image
          source={require('@/assets/images/banner.jpg')}
          style={styles.banner}
        />
        <View
          style={[
            { height: insets.top, ...styles.viewStatus },
            {
              backgroundColor:
                theme == ThemeEnum.Dark ? '#0000007a' : '#ffffff25',
            },
          ]}
        />
      </View>
      <View style={styles.viewContent}>
        <View style={styles.viewWellcome}>
          <ThemedText type="title" style={styles.textWellcome}>
            Bem-vindo!
          </ThemedText>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <ThemedText type="subtitle">Detector de assédio moral</ThemedText>
            <ThemedText type="small" style={styles.textContent}>
              Este é um aplicativo que detecta{' '}
              <ThemedText type="defaultSemiBold">assédio moral</ThemedText>{' '}
              encontrado em uma conversa. Experimente agora acessando a aba{' '}
              <ThemedText
                type="defaultSemiBold"
                onPress={() => {
                  router.push('/record')
                }}
              >
                Gravar
              </ThemedText>
              .
            </ThemedText>
          </View>
          <View style={styles.viewScroll}>
            <ThemedText type="subtitle">Contexto</ThemedText>
            <ThemedText type="small" style={styles.textContent}>
              Este aplicativo foi desenvolvido para fins acadêmicos. É um
              trabalho da disciplina de{' '}
              <ThemedText type="defaultSemiBold">
                Sistemas de computação móvel e pervasiva
              </ThemedText>
              . O tema principal é "Interação Humano-Computador e Sistemas
              Centrados no Usuário" relacionado a{' '}
              <ThemedText type="defaultSemiBold">
                ubiquitous data (dados ubíquos)
              </ThemedText>
              .
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  viewImage: {
    height: 320,
  },
  viewStatus: {
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  viewContent: {
    gap: 32,
    padding: 32,
  },
  viewWellcome: {
    flexDirection: 'row',
  },
  textWellcome: {
    marginRight: 8,
  },
  textContent: {
    marginTop: 8,
    textAlign: 'justify',
  },
  viewScroll: {
    marginTop: 32,
    minHeight: 600,
  },
  banner: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})
