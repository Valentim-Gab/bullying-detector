import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

export default function Layout() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { colors } = useTheme()

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login')
    }
  }, [isAuthenticated])

  if (isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size={100} />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="(modals)/modal-detect/[id]"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="phrase/[id]"
        options={({ route }) => ({
          headerTitle: `Detecção #${
            (route.params as { id: number })?.id ?? 0
          } - Database`,
          animation: 'slide_from_right',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.backgroundSecondary,
          },
          headerTintColor: colors.text,
        })}
      />
      <Stack.Screen
        name="phrase/details/[id]"
        options={({ route }) => ({
          headerTitle: `Detecção #${
            (route.params as { id: number })?.id ?? 0
          } - Detalhes`,
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.backgroundSecondary,
          },
          headerTintColor: colors.text,
        })}
      />
    </Stack>
  )
}
