import { ThemedSafeView } from '@/components/ThemedSafeView'
import { useFocusEffect, useRouter } from 'expo-router'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTheme } from '@/hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthToken, LoginData } from '@/interfaces/Auth'
import { signIn } from '@/services/AuthService'
import { User } from '@/interfaces/User'
import { useEffect, useState } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/hooks/useAuth'
import * as SecureStore from 'expo-secure-store'
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import InputPrimary from '@/components/inputs/InputPrimary'
import Toast from 'react-native-toast-message'

export const formSchema = z.object({
  username: z
    .string()
    .email({ message: 'Email é inválido' })
    .min(1, { message: 'Email é obrigatório' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
})

export default function LoginScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { colors } = useTheme()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: (loginData: LoginData) => signIn(loginData),
    onSuccess: (data: { user: User; tokens: AuthToken }) => {
      Toast.show({
        type: 'success',
        text1: 'Login efetuado com sucesso',
        text1Style: { fontSize: RFValue(14) },
      })
      SecureStore.setItemAsync('access_token', data.tokens.accessToken)
      SecureStore.setItemAsync('refresh_token', data.tokens.refreshToken)
      router.replace('/')
    },
    onMutate: () => {
      setIsLoading(true)
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: error.message,
        text1Style: { fontSize: RFValue(14) },
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(values)
  }

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  useFocusEffect(() => {
    queryClient.clear()
  })

  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace('/(protected)/(tabs)')
    }
  }, [isAuthenticated])

  return (
    <ThemedSafeView style={styles.container}>
      <Image
        source={require('@/assets/images/logos/logo.png')}
        alt="Logo"
        style={styles.image}
      />
      <View style={styles.formFieldView}>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <InputPrimary
              label="Email"
              placeholder="Digite seu email"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.username && (
          <Text style={[styles.error, { color: colors.negative }]}>
            {errors.username.message}
          </Text>
        )}
      </View>

      <View style={styles.formFieldView}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <InputPrimary
              label="Senha"
              placeholder="Digite sua senha"
              value={value}
              secureTextEntry={!showPassword}
              leftIcon={
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={RFValue(24)}
                  color={colors.placeholder}
                  onPress={handleShowPassword}
                />
              }
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && (
          <Text style={[styles.error, { color: colors.negative }]}>
            {errors.password.message}
          </Text>
        )}
      </View>

      <View style={{ width: '100%', marginTop: 24 }}>
        <ButtonPrimary
          title="Login"
          icon={
            <Ionicons
              name="log-in-outline"
              size={RFValue(20)}
              color="#fff"
              style={{ marginRight: 8 }}
            />
          }
          onPress={handleSubmit(onSubmit)}
        />
      </View>
      <Modal visible={isLoading} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size={RFValue(52)} color="#fff" />
          <ThemedText type="small" style={{ marginTop: 16 }}>
            Validando credenciais...
          </ThemedText>
        </View>
      </Modal>
    </ThemedSafeView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  image: {
    objectFit: 'contain',
    width: '100%',
    height: 120,
    marginBottom: 16,
  },
  formFieldView: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  error: {
    marginTop: 4,
  },
})
