import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  ScrollView,
  ScrollViewComponent,
  Dimensions,
} from 'react-native'
import { HelloWave } from '@/components/HelloWave'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import React from 'react'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()

  const windowHeight = Dimensions.get('window').height

  // Define a altura máxima do ScrollView com base na altura da janela
  const scrollViewHeight = windowHeight - 80 // 80 é a altura do banner, ajuste conforme necessário

  return (
    <ThemedView className="h-full">
      <View className="h-80">
        <Image
          source={require('@/assets/images/banner.jpg')}
          style={styles.banner}
        />
        <View
          style={{ height: insets.top }}
          className="bg-[#ffffff25] dark:bg-[#0000007a] absolute top-0 w-full"
        />
      </View>
      <View className="p-8 gap-8">
        <View className="flex-row">
          <ThemedText type="title" className="mr-2">
            Bem-vindo!
          </ThemedText>
          <HelloWave />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <ThemedText type="subtitle">Detector de assédio moral</ThemedText>
            <ThemedText className="mt-2 text-justify">
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
          <View className="mt-8 min-h-[600px]">
            <ThemedText type="subtitle">Contexto</ThemedText>
            <ThemedText className="mt-2 text-justify">
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
  banner: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})
