import { RefreshControl, StyleSheet, View } from 'react-native'
import { ThemeEnum } from '@/enums/ThemeEnum'
import { ThemedScroll } from '@/components/ThemedScroll'
import { ThemedText } from '@/components/ThemedText'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/hooks/useTheme'
import { signOut } from '@/services/AuthService'
import { Ionicons } from '@expo/vector-icons'
import { RFValue } from 'react-native-responsive-fontsize'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UserService } from '@/services/UserService'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import Checkbox from 'expo-checkbox'

export default function ProfileScreen() {
  const { theme, isSystemTheme, setLightTheme, setDarkTheme, setSystemTheme } =
    useTheme()
  const userService = new UserService()
  const queryClient = useQueryClient()
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user_me'],
    queryFn: () => userService.getMe(),
    refetchOnMount: false,
  })

  const refechUser = () => {
    queryClient.refetchQueries({ queryKey: ['user_me'] })
  }

  const logout = () => {
    queryClient.clear()
    signOut()
  }

  return (
    <ThemedScroll
      style={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refechUser} />
      }
    >
      <View style={styles.container}>
        <ThemedText type="title">Perfil</ThemedText>
        <View style={styles.profileSection}>
          <ThemedText type="subtitle">Informações</ThemedText>
          <ThemedText style={{ marginTop: 8 }}>
            <ThemedText type="defaultSemiBold">Nome: </ThemedText>
            {user?.name || 'Carregando...'}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Email: </ThemedText>
            {user?.email || 'Carregando...'}
          </ThemedText>
        </View>
        <View style={styles.themeSection}>
          <ThemedText type="subtitle">Tema</ThemedText>
          <View style={styles.checkboxSection}>
            <Checkbox
              style={styles.checkbox}
              value={ThemeEnum.Light === theme && !isSystemTheme}
              color={Colors.light.primary}
              onValueChange={() => setLightTheme()}
            />
            <ThemedText>Claro</ThemedText>
          </View>
          <View style={styles.checkboxSection}>
            <Checkbox
              style={styles.checkbox}
              value={ThemeEnum.Dark === theme && !isSystemTheme}
              color={Colors.light.primary}
              onValueChange={() => setDarkTheme()}
            />
            <ThemedText>Escuro</ThemedText>
          </View>
          <View style={styles.checkboxSection}>
            <Checkbox
              style={styles.checkbox}
              value={isSystemTheme}
              color={Colors.light.primary}
              onValueChange={() => setSystemTheme()}
            />
            <ThemedText>Sistema</ThemedText>
          </View>
        </View>
        <ButtonPrimary
          title="Sair"
          dense={true}
          icon={
            <Ionicons
              name="log-out-outline"
              size={RFValue(20)}
              color="#fff"
              style={{ marginRight: 8 }}
            />
          }
          onPress={logout}
        />
      </View>
    </ThemedScroll>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    gap: 32,
    padding: 32,
  },
  profileSection: {
    flexDirection: 'column',
  },
  themeSection: {
    flexDirection: 'column',
    gap: 16,
  },
  checkboxSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
})
