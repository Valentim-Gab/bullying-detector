import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Colors } from '@/constants/Colors'
import { AudioDetect } from '@/interfaces/Detection'
import { AudioService } from '@/services/DetectionService'
import { useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'

export default function PhraseScreen() {
  const { id } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [audio, setAudio] = useState<AudioDetect | null>(null)
  const [username, setUsername] = useState('')
  const [disableActions, setDisableActions] = useState(false)
  const audioService = useMemo(() => new AudioService(), [])
  const { theme, colors } = useTheme()

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

  const handleSend = async (approve: boolean) => {
    if (disableActions) {
      return
    }

    setLoadingSave(true)

    if (!audio || !audio.idPhrase) {
      return
    }

    const updatePhrase = {
      idDetection: audio.idDetection,
      username: username,
      approve: approve,
    }

    const result = await audioService.updateHarassmentPhrase(
      updatePhrase,
      audio.idPhrase
    )

    setLoadingSave(false)

    if (result) {
      setUsername('')
      setDisableActions(true)
      fetchAudio(Number(id))
    }
  }

  if (loading) {
    return (
      <ThemedSafeView style={{ flex: 1, padding: 32 }}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedSafeView>
    )
  }

  if (!audio) {
    return (
      <ThemedSafeView style={{ flex: 1, padding: 32 }}>
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
      <ScrollView style={{ paddingHorizontal: 32 }}>
        <ThemedText>
          <ThemedText style={{ fontWeight: 'bold' }}>Texto gerado: </ThemedText>
          {audio.mainText}
        </ThemedText>
        <ThemedView style={{ marginTop: 16 }}>
          <ThemedText>
            Registre a sua opinião se o texto gerado contém assédio moral
          </ThemedText>
          <ThemedText style={{ marginTop: 16 }}>Nome:</ThemedText>
          <TextInput
            placeholder="Digite seu nome de usuário"
            placeholderTextColor={Colors.light.placeholder}
            value={username}
            readOnly={disableActions}
            style={[
              styles.input,
              disableActions ? { opacity: 0.2 } : {},
              {
                borderColor: colors.mutedStrong,
              },
            ]}
            onChangeText={setUsername}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Pressable
              disabled={loading || disableActions}
              style={[
                styles.btnNegative,
                disableActions ? { opacity: 0.2 } : {},
                { backgroundColor: colors.negative },
              ]}
              onPress={() => handleSend(false)}
            >
              <View
                style={[styles.btnSendContent, { opacity: loading ? 0.6 : 1 }]}
              >
                <Ionicons name="close" size={32} color="white" />
                <Text style={{ color: '#fff', fontSize: 16 }}>
                  Desconsiderar
                </Text>
              </View>
            </Pressable>
            <Pressable
              disabled={loading || disableActions}
              onPress={() => handleSend(true)}
              style={[
                styles.btnPositive,
                disableActions ? { opacity: 0.2 } : {},
                { backgroundColor: colors.positive },
              ]}
            >
              <View
                style={[styles.btnSendContent, { opacity: loading ? 0.6 : 1 }]}
              >
                <Ionicons name="checkmark" size={32} color="white" />
                <Text style={{ color: '#fff', fontSize: 16 }}>Considerar</Text>
              </View>
            </Pressable>
          </View>
        </ThemedView>
        <View
          style={[
            styles.sectionOpinions,
            { backgroundColor: colors.card, borderColor: colors.mutedStrong },
          ]}
        >
          <View style={{ paddingHorizontal: 24 }}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Opiniões dos usuários
            </ThemedText>
            <View style={styles.sectionOpinionsContent}>
              <Text
                style={{
                  color: colors.negative,
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Desconsidera ({audio.databaseUsersReject?.length ?? 0})
              </Text>
              <Ionicons name="close" size={28} color={colors.text} />
              <Text
                style={{
                  color: colors.positive,
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                ({audio.databaseUsersApprove?.length ?? 0}) Considera
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 24 }}>
            <View style={styles.sectionOpinionsContent}>
              <View>
                {audio.databaseUsersReject &&
                  audio.databaseUsersReject.map((user, index) => (
                    <ThemedText key={index}>{user}</ThemedText>
                  ))}
              </View>
              <View className="flex flex-col gap-0 flex-nowrap">
                {audio.databaseUsersApprove &&
                  audio.databaseUsersApprove.map((user, index) => (
                    <ThemedText key={index} style={{ textAlign: 'right' }}>
                      {user ? user : '-'}
                    </ThemedText>
                  ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 24,
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
  btnNegative: {
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    width: '48%',
  },
  btnPositive: {
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    width: '48%',
  },
  btnSendContent: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sectionOpinions: {
    minHeight: 300,
    marginTop: 32,
    marginBottom: 128,
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionOpinionsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
})
