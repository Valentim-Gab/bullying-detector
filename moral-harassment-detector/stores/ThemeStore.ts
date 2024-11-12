import { ThemeEnum } from '@/enums/ThemeEnum';
import * as SecureStore from 'expo-secure-store';

export function saveTheme(value: ThemeEnum) {
  SecureStore.setItem('theme', value);
}

export function getTheme() {
  const theme = SecureStore.getItem('theme');

  if (!theme) {
    return null;
  }

  return theme as ThemeEnum;
}

export async function getAsyncTheme() {
  const theme = await SecureStore.getItemAsync('theme');

  if (!theme) {
    return null;
  }

  return theme as ThemeEnum;
}