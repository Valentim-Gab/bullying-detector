import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/hooks/useTheme'
import { AudioDetect } from '@/interfaces/Audio'
import { AudioService } from '@/services/AudioService'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native'

export default function PhraseScreen() {
  const { id } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [audio, setAudio] = useState<AudioDetect | null>(null)
  const [username, setUsername] = useState('')
  const { theme, colors } = useTheme()
  const audioService = useMemo(() => new AudioService(), [])

  const fetchAudio = async (id: number) => {
    setLoading(true)

    const data = await audioService.get(id)

    if (data) {
      setAudio(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAudio(Number(id))
  }, [])

  const handleSend = async () => {
    setLoadingSave(true)

    if (!audio) {
      return
    }

    const result = await audioService.saveHarassmentPhrase({
      phrase: audio.recordingTranscribed,
      username: username,
      idDetection: audio.idDetection,
    })

    setLoadingSave(false)

    if (result) {
      router.back()
    }
  }

  if (loading) {
    return (
      <ThemedSafeView style={{ flex: 1, padding: 16 }}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedSafeView>
    )
  }

  if (!audio) {
    return (
      <ThemedSafeView style={{ flex: 1, padding: 16 }}>
        <ThemedText>Audio não encontrado.</ThemedText>
      </ThemedSafeView>
    )
  }

  return (
    <ThemedSafeView
      style={[
        { flex: 1 },
        theme === 'dark' && {
          borderTopWidth: 1,
          borderTopColor: colors.mutedStrong,
        },
      ]}
    >
      <ThemedView style={{ flex: 1, paddingHorizontal: 32 }}>
        <ThemedText>
          <ThemedText style={{ fontWeight: 'bold' }}>Texto gerado: </ThemedText>
          {audio.recordingTranscribed}
        </ThemedText>
        <ThemedView style={{ marginTop: 16 }}>
          <ThemedText>Nome:</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.mutedStrong,
              },
            ]}
            placeholder="Digite seu nome de usuário"
            placeholderTextColor={Colors.light.placeholder}
            value={username}
            onChangeText={setUsername}
          />
          <Pressable
            style={styles.btnContainer}
            disabled={loading}
            onPress={handleSend}
          >
            <ThemedView
              style={[styles.btnContent, { opacity: loading ? 0.6 : 1 }]}
            >
              {!loading && (
                <Text style={{ color: '#fff', fontSize: 16 }}>Enviar</Text>
              )}
              {loading && (
                <ThemedView style={styles.btnContentLoading}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={{ color: '#fff', fontSize: 16 }}>
                    Processando áudio
                  </Text>
                </ThemedView>
              )}
            </ThemedView>
          </Pressable>
        </ThemedView>
        <ThemedText style={{ marginTop: 32, textAlign: 'justify' }}>
          Ao enviar, o texto gerado passará a ser considerado assédio moral para
          o nosso sistema. Registre seu nome para que os outros usuários possam
          verificar a autenticidade da denúncia.
        </ThemedText>
      </ThemedView>
      {loadingSave && (
        <ThemedView
          style={[
            styles.loadingView,
            { backgroundColor: theme === 'dark' ? '#0000009d' : '#ffffff9d' },
          ]}
        >
          <ActivityIndicator color={Colors.light.primary} size="large" />
        </ThemedView>
      )}
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  btnContainer: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnContent: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContentLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff9d',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
})
