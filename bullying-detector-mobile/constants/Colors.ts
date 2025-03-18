/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primary = '#8f3d38'
const primaryDark = '#8f3d38'
const secondary = '#632a64'

export const Colors = {
  light: {
    primary: primary,
    secondary: secondary,
    text: '#11181C',
    background: '#fff',
    backgroundSecondary: '#fff',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primary,
    placeholder: '#687076',
    muted: '#f9f9f9',
    mutedStrong: '#ccc',
    card: '#fff',
    cardForeground: '#11181C',
    positive: '#2e7d32',
    negative: '#c62828',
    warning: '#f57f17',
  },
  dark: {
    primary: primaryDark,
    secondary: secondary,
    text: '#ECEDEE',
    background: '#0E0E0E',
    backgroundSecondary: '#090909',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryDark,
    muted: '#777',
    mutedStrong: '#444',
    card: '#111',
    cardForeground: '#ECEDEE',
    positive: '#2e7d32',
    negative: '#c62828',
    warning: '#f57f17',
  },
}
