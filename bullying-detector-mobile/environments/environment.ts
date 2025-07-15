import Constants from 'expo-constants'

export const environment = {
  production: process.env.NODE_ENV === 'production',
  apiUrl: Constants.expoConfig?.extra?.apiUrl || '',
  // apiUrl: 'http://192.168.0.3:3000',
  // apiUrl: 'http://192.168.0.195:3000',
  // apiUrl: 'http://172.27.4.35:3000',
}
 