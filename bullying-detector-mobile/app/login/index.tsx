import { ThemedSafeView } from '@/components/ThemedSafeView'
import { ThemedText } from '@/components/ThemedText'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { View, Text, Button, Image, StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'

export default function LoginScreen() {
  const router = useRouter()

  const handleLogin = async () => {
    await SecureStore.setItemAsync('auth_token', 'user_token')
    router.replace('/') // Vai para a Home
  }

  return (
    <ThemedSafeView style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        alt="Logo"
        style={styles.image}
      />
      <ThemedText style={styles.text}>Login</ThemedText>
      <Button title="Login" onPress={handleLogin} />
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
  text: {
    fontSize: RFValue(32),
    lineHeight: RFValue(32),
    marginBottom: 20,
  },
  image: {
    objectFit: 'contain',
    width: '100%',
    
  },
})
