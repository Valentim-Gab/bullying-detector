import { ThemedText } from '@/components/ThemedText'
import { AudioService } from '@/services/AudioService'
import { Audio } from 'expo-av'
import { useEffect, useMemo, useState } from 'react'
import { Button } from 'react-native'
import { ThemedSafeView } from '../ThemedSafeView'

export default function TesteScreen() {
  const audioService = useMemo(() => new AudioService(), [])
  const [sound, setSound] = useState<any>()
  const [data, setData] = useState<any>()

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/audios/music.mp3')
    )

    setSound(sound)

    await sound.playAsync()
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  return (
    <ThemedSafeView className="flex-1 justify-center items-center">
      <ThemedText>Hello World! 2</ThemedText>
      <Button title="Play Sound" onPress={playSound} />
      {data && <ThemedText>{JSON.stringify(data)}</ThemedText>}
    </ThemedSafeView>
  )
}
